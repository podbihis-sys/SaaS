from __future__ import annotations

from datetime import timedelta

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Office, Service, Slot, User
from app.models.base import utcnow
from app.models.enums import SlotStatus
from app.security import issue_token


async def test_device_auth_is_idempotent(client: AsyncClient) -> None:
    """Reopening the app must not create a second account."""
    payload = {"install_id": "install-abc-123", "locale": "de"}
    first = await client.post("/api/v1/auth/device", json=payload)
    second = await client.post("/api/v1/auth/device", json=payload)

    assert first.status_code == 200
    assert first.json()["user_id"] == second.json()["user_id"]


async def test_protected_route_rejects_missing_and_bad_tokens(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/watches")).status_code == 401
    bad = await client.get("/api/v1/watches", headers={"Authorization": "Bearer not-a-jwt"})
    assert bad.status_code == 401
    assert bad.json()["code"] == "unauthorized"


async def test_watch_crud_roundtrip(
    client: AsyncClient, auth_headers: dict[str, str], office: Office, service: Service
) -> None:
    created = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={
            "label": "Personalausweis Testhausen",
            "category": "personalausweis",
            "office_ids": [str(office.id)],
            "weekday_mask": 0b0011111,
            "earliest_time": "09:00:00",
            "latest_time": "13:00:00",
            "min_lead_hours": 6,
        },
    )
    assert created.status_code == 201, created.text
    watch_id = created.json()["id"]
    assert created.json()["offices"][0]["name"] == office.name

    listed = await client.get("/api/v1/watches", headers=auth_headers)
    assert [w["id"] for w in listed.json()] == [watch_id]

    patched = await client.patch(
        f"/api/v1/watches/{watch_id}", headers=auth_headers, json={"label": "Umbenannt", "active": False}
    )
    assert patched.json()["label"] == "Umbenannt"
    assert patched.json()["active"] is False

    deleted = await client.delete(f"/api/v1/watches/{watch_id}", headers=auth_headers)
    assert deleted.status_code == 200
    assert (await client.get("/api/v1/watches", headers=auth_headers)).json() == []


async def test_watch_of_another_user_is_not_reachable(
    client: AsyncClient,
    auth_headers: dict[str, str],
    session: AsyncSession,
    office: Office,
) -> None:
    """Accounts are anonymous, which makes leak-proof ownership checks essential."""
    created = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={"label": "Meins", "category": "personalausweis", "office_ids": [str(office.id)]},
    )
    watch_id = created.json()["id"]

    intruder = User(install_id="intruder-0009")
    session.add(intruder)
    await session.flush()
    token, _ = issue_token(intruder.id)
    other_headers = {"Authorization": f"Bearer {token}"}

    assert (await client.get(f"/api/v1/watches/{watch_id}", headers=other_headers)).status_code == 404
    assert (
        await client.patch(
            f"/api/v1/watches/{watch_id}", headers=other_headers, json={"label": "geklaut"}
        )
    ).status_code == 404
    assert (await client.delete(f"/api/v1/watches/{watch_id}", headers=other_headers)).status_code == 404


async def test_watch_rejects_unknown_office(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    response = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={
            "label": "Nirgendwo",
            "category": "personalausweis",
            "office_ids": ["00000000-0000-0000-0000-000000000001"],
        },
    )
    assert response.status_code == 422


async def test_watch_rejects_inverted_date_range(
    client: AsyncClient, auth_headers: dict[str, str], office: Office
) -> None:
    response = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={
            "label": "Rückwärts",
            "category": "personalausweis",
            "office_ids": [str(office.id)],
            "earliest_date": "2026-05-10",
            "latest_date": "2026-05-01",
        },
    )
    assert response.status_code == 422


async def test_watch_detail_lists_only_matching_slots(
    client: AsyncClient,
    auth_headers: dict[str, str],
    session: AsyncSession,
    office: Office,
    service: Service,
) -> None:
    soon = Slot(
        office_id=office.id,
        service_id=service.id,
        starts_at=utcnow() + timedelta(hours=1),
        status=SlotStatus.AVAILABLE,
    )
    later = Slot(
        office_id=office.id,
        service_id=service.id,
        starts_at=utcnow() + timedelta(days=3),
        status=SlotStatus.AVAILABLE,
    )
    session.add_all([soon, later])
    await session.flush()

    created = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={
            "label": "Mit Vorlauf",
            "category": "personalausweis",
            "office_ids": [str(office.id)],
            "min_lead_hours": 24,
        },
    )
    detail = await client.get(f"/api/v1/watches/{created.json()['id']}", headers=auth_headers)

    slot_ids = [s["id"] for s in detail.json()["matching_slots"]]
    assert str(later.id) in slot_ids
    assert str(soon.id) not in slot_ids


async def test_office_search_by_city_and_category(
    client: AsyncClient, office: Office, service: Service
) -> None:
    by_city = await client.get("/api/v1/offices", params={"city": "Testhausen"})
    assert by_city.json()["total"] == 1

    by_category = await client.get("/api/v1/offices", params={"category": "personalausweis"})
    assert by_category.json()["total"] == 1

    wrong_category = await client.get("/api/v1/offices", params={"category": "kfz_zulassung"})
    assert wrong_category.json()["total"] == 0


async def test_office_search_by_radius(client: AsyncClient, office: Office) -> None:
    """The office sits at 52.5/13.4; a point 2 km away is in, 300 km away is out."""
    near = await client.get(
        "/api/v1/offices", params={"latitude": 52.51, "longitude": 13.41, "radius_km": 5}
    )
    assert near.json()["total"] == 1
    assert near.json()["items"][0]["distance_km"] < 5

    far = await client.get(
        "/api/v1/offices", params={"latitude": 48.13, "longitude": 11.58, "radius_km": 10}
    )
    assert far.json()["total"] == 0


async def test_office_search_requires_both_coordinates(client: AsyncClient) -> None:
    response = await client.get("/api/v1/offices", params={"latitude": 52.5})
    assert response.status_code == 422


async def test_slots_endpoint_hides_gone_and_past_slots(
    client: AsyncClient, session: AsyncSession, office: Office, service: Service
) -> None:
    session.add_all(
        [
            Slot(
                office_id=office.id,
                service_id=service.id,
                starts_at=utcnow() + timedelta(days=1),
                status=SlotStatus.AVAILABLE,
            ),
            Slot(
                office_id=office.id,
                service_id=service.id,
                starts_at=utcnow() + timedelta(days=2),
                status=SlotStatus.GONE,
            ),
            Slot(
                office_id=office.id,
                service_id=service.id,
                starts_at=utcnow() - timedelta(days=1),
                status=SlotStatus.AVAILABLE,
            ),
        ]
    )
    await session.flush()

    response = await client.get("/api/v1/slots")
    assert len(response.json()) == 1
    assert response.json()[0]["office_name"] == office.name


async def test_booking_handoff_and_resolution(
    client: AsyncClient,
    auth_headers: dict[str, str],
    session: AsyncSession,
    office: Office,
    service: Service,
) -> None:
    slot = Slot(
        office_id=office.id,
        service_id=service.id,
        starts_at=utcnow() + timedelta(days=1),
        status=SlotStatus.AVAILABLE,
    )
    session.add(slot)
    await session.flush()

    watch = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={"label": "Perso", "category": "personalausweis", "office_ids": [str(office.id)]},
    )
    watch_id = watch.json()["id"]

    booking = await client.post(
        "/api/v1/bookings",
        headers=auth_headers,
        json={"slot_id": str(slot.id), "watch_id": watch_id},
    )
    assert booking.status_code == 201
    # The handoff points at the authority's own site, never at us.
    assert booking.json()["handoff_url"].startswith("https://demo.invalid")
    assert booking.json()["status"] == "handed_off"

    resolved = await client.post(
        f"/api/v1/bookings/{booking.json()['id']}/resolve",
        headers=auth_headers,
        json={"status": "confirmed"},
    )
    assert resolved.json()["status"] == "confirmed"

    # Confirming retires the watch, so the user stops being told about an
    # errand they have already run.
    detail = await client.get(f"/api/v1/watches/{watch_id}", headers=auth_headers)
    assert detail.json()["active"] is False


async def test_booking_rejects_a_slot_that_is_gone(
    client: AsyncClient,
    auth_headers: dict[str, str],
    session: AsyncSession,
    office: Office,
    service: Service,
) -> None:
    slot = Slot(
        office_id=office.id,
        service_id=service.id,
        starts_at=utcnow() + timedelta(days=1),
        status=SlotStatus.GONE,
    )
    session.add(slot)
    await session.flush()

    response = await client.post(
        "/api/v1/bookings", headers=auth_headers, json={"slot_id": str(slot.id)}
    )
    assert response.status_code == 422


async def test_device_registration_and_reassignment(
    client: AsyncClient, auth_headers: dict[str, str], session: AsyncSession
) -> None:
    """A reinstalled app presents the same push token under a new account."""
    token = "ExponentPushToken[abcdefghijklmnop]"
    first = await client.post(
        "/api/v1/auth/devices",
        headers=auth_headers,
        json={"push_token": token, "platform": "android"},
    )
    assert first.status_code == 201

    other = User(install_id="reinstalled-0003")
    session.add(other)
    await session.flush()
    other_token, _ = issue_token(other.id)

    second = await client.post(
        "/api/v1/auth/devices",
        headers={"Authorization": f"Bearer {other_token}"},
        json={"push_token": token, "platform": "android"},
    )
    assert second.status_code == 201
    assert second.json()["id"] == first.json()["id"]


async def test_health_endpoints(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/health")).json()["status"] == "ok"
    scanner = await client.get("/api/v1/health/scanner")
    assert scanner.json()["providers"] == ["demo"]


async def test_watch_rejects_an_office_that_may_not_be_scanned(
    client: AsyncClient, auth_headers: dict[str, str], session: AsyncSession, office: Office
) -> None:
    """Bremen's offices are listed but not pollable; a watch on one would
    never fire, so it is refused with an explanation rather than accepted."""
    office.scan_enabled = False
    office.scan_blocked_reason = "robots.txt"
    await session.flush()

    response = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={"label": "Geht nicht", "category": "personalausweis", "office_ids": [str(office.id)]},
    )

    assert response.status_code == 422
    assert "nicht überwacht werden" in response.json()["message"]


async def test_unscannable_offices_are_still_listed(
    client: AsyncClient, session: AsyncSession, office: Office, service: Service
) -> None:
    """Listing is what lets a user find the office and book with the authority."""
    office.scan_enabled = False
    await session.flush()

    response = await client.get("/api/v1/offices", params={"city": "Testhausen"})
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["scan_enabled"] is False
