"""Push delivery, asserted through a stubbed Expo transport."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Device, Notification, Office, Service, Slot, User, Watch
from app.models.base import utcnow
from app.models.enums import DevicePlatform, NotificationStatus, ServiceCategory, SlotStatus
from app.services import notifier as notifier_module
from app.services.notifier import (
    PushMessage,
    build_alert_text,
    deliver_pending,
    format_slot_datetime,
    send_push,
)


def stub_expo(monkeypatch: pytest.MonkeyPatch, tickets: list[dict]) -> list[httpx.Request]:
    """Replace Expo with a transport that returns scripted tickets."""
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, json={"data": tickets})

    original = httpx.AsyncClient

    def factory(*args, **kwargs):  # noqa: ANN002, ANN003, ANN202
        kwargs["transport"] = httpx.MockTransport(handler)
        return original(*args, **kwargs)

    monkeypatch.setattr(notifier_module.settings, "PUSH_ENABLED", True)
    monkeypatch.setattr(notifier_module.httpx, "AsyncClient", factory)
    return seen


async def build_notification(
    session: AsyncSession, user: User, office: Office, service: Service
) -> Notification:
    watch = Watch(user_id=user.id, label="Perso", category=ServiceCategory.PERSONALAUSWEIS)
    watch.offices = [office]
    slot = Slot(
        office_id=office.id,
        service_id=service.id,
        starts_at=utcnow() + timedelta(days=2),
        status=SlotStatus.AVAILABLE,
    )
    session.add_all([watch, slot])
    await session.flush()

    notification = Notification(
        watch_id=watch.id,
        slot_id=slot.id,
        user_id=user.id,
        title="Termin frei",
        body="Personalausweis",
        status=NotificationStatus.PENDING,
    )
    session.add(notification)
    await session.flush()
    return notification


def test_format_slot_datetime_is_german_and_local() -> None:
    # 08:05 UTC on a Tuesday is 09:05 in Berlin.
    stamp = datetime(2026, 3, 3, 8, 5, tzinfo=UTC)
    assert format_slot_datetime(stamp, "Europe/Berlin") == "Di, 03.03. um 09:05 Uhr"


def test_alert_text_leads_with_the_time() -> None:
    """A lock screen shows the title and little else."""
    title, body = build_alert_text(
        service_name="Personalausweis beantragen",
        office_name="Bürgeramt Mitte",
        city="Berlin",
        starts_at=datetime(2026, 3, 3, 8, 5, tzinfo=UTC),
        timezone="Europe/Berlin",
    )
    assert title.startswith("Termin frei: Di, 03.03.")
    assert "Bürgeramt Mitte" in body
    assert "Berlin" in body


async def test_delivery_marks_notifications_sent(
    session: AsyncSession,
    user: User,
    office: Office,
    service: Service,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session.add(
        Device(user_id=user.id, push_token="ExponentPushToken[aaa]", platform=DevicePlatform.IOS)
    )
    notification = await build_notification(session, user, office, service)
    requests = stub_expo(monkeypatch, [{"status": "ok", "id": "ticket-1"}])

    sent = await deliver_pending(session, [notification.id])

    assert sent == 1
    assert notification.status == NotificationStatus.SENT
    assert notification.sent_at is not None
    assert len(requests) == 1


async def test_delivery_without_a_device_fails_cleanly(
    session: AsyncSession,
    user: User,
    office: Office,
    service: Service,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    notification = await build_notification(session, user, office, service)
    stub_expo(monkeypatch, [])

    sent = await deliver_pending(session, [notification.id])

    assert sent == 0
    assert notification.status == NotificationStatus.FAILED
    assert notification.error == "no_active_device"


async def test_dead_token_is_retired(
    session: AsyncSession,
    user: User,
    office: Office,
    service: Service,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A token Expo rejects would otherwise fail on every future slot forever."""
    device = Device(
        user_id=user.id, push_token="ExponentPushToken[dead]", platform=DevicePlatform.ANDROID
    )
    session.add(device)
    notification = await build_notification(session, user, office, service)
    stub_expo(
        monkeypatch,
        [{"status": "error", "message": "gone", "details": {"error": "DeviceNotRegistered"}}],
    )

    await deliver_pending(session, [notification.id])

    refreshed = (
        await session.execute(select(Device).where(Device.id == device.id))
    ).scalar_one()
    await session.refresh(refreshed)
    assert refreshed.active is False
    assert refreshed.invalidated_at is not None
    assert notification.status == NotificationStatus.FAILED


async def test_transport_failure_does_not_lose_the_notification(
    session: AsyncSession,
    user: User,
    office: Office,
    service: Service,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session.add(
        Device(user_id=user.id, push_token="ExponentPushToken[bbb]", platform=DevicePlatform.IOS)
    )
    notification = await build_notification(session, user, office, service)

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("expo unreachable")

    original = httpx.AsyncClient

    def factory(*args, **kwargs):  # noqa: ANN002, ANN003, ANN202
        kwargs["transport"] = httpx.MockTransport(handler)
        return original(*args, **kwargs)

    monkeypatch.setattr(notifier_module.settings, "PUSH_ENABLED", True)
    monkeypatch.setattr(notifier_module.httpx, "AsyncClient", factory)

    sent = await deliver_pending(session, [notification.id])

    assert sent == 0
    assert notification.status == NotificationStatus.FAILED
    assert notification.error == "transport_error"


async def test_push_disabled_short_circuits(
    session: AsyncSession, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(notifier_module.settings, "PUSH_ENABLED", False)
    outcomes = await send_push(
        session, [PushMessage(to="ExponentPushToken[x]", title="t", body="b", data={})]
    )
    assert outcomes == {"ExponentPushToken[x]": "disabled"}


async def test_empty_batches_are_noops(session: AsyncSession) -> None:
    assert await send_push(session, []) == {}
    assert await deliver_pending(session, []) == 0
