from __future__ import annotations

import json
from pathlib import Path

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.catalog.portals import load_portals
from app.core.errors import ProviderError
from app.models import Office
from app.models.enums import AuthorityType, Provider
from app.providers import get_provider
from scripts.build_portal_catalog import authority_for, load_rows, name_for


def test_portal_entries_are_listed_but_never_scanned() -> None:
    entries = load_portals()
    assert entries, "app/data/portals.json is empty — run scripts/build_portal_catalog"
    for entry in entries:
        assert entry["provider"] is Provider.PORTAL
        assert entry["active"] is True
        # The whole point of a portal row: findable, linkable, never polled.
        assert entry["scan_enabled"] is False
        assert entry["scan_blocked_reason"]
        # The URL is kept exactly as the authority published it. A handful
        # still link over plain http; rewriting that to https would be a guess
        # about a host we have not checked, and a wrong guess sends the user
        # to a dead page instead of their appointment.
        assert entry["booking_url"].startswith(("https://", "http://"))
        assert len(entry["municipality_ags"]) == 8
        assert isinstance(entry["authority_type"], AuthorityType)

    ids = [entry["external_id"] for entry in entries]
    assert len(ids) == len(set(ids))


def test_no_adapter_is_registered_for_portal() -> None:
    """A portal must fail loudly if anything ever tries to poll it."""
    with pytest.raises(ProviderError):
        get_provider(Provider.PORTAL)


def test_authority_is_read_from_the_booking_url() -> None:
    assert (
        authority_for("https://termine-reservieren.de/termine/remscheid/auslaenderbehoerde")
        is AuthorityType.AUSLAENDERBEHOERDE
    )
    assert authority_for("https://termine.stadt-x.de/select2?md=3") is AuthorityType.BUERGERAMT, (
        "a municipal portal that says nothing is the citizens' office"
    )
    assert (
        authority_for("https://termine.kreis-x.de/select2?md=3", is_kreis=True) is AuthorityType.SONSTIGES
    ), "a district's general portal is not the citizens' office of its seat"


def test_kreis_portals_are_named_as_such() -> None:
    row = {"city": "Rheinisch-Bergischer Kreis"}
    assert name_for(row, {"Rheinisch-Bergischer Kreis"}) == (
        "Terminvergabe Rheinisch-Bergischer Kreis (Kreisverwaltung)"
    )
    assert name_for({"city": "Odenthal"}, set()) == "Terminvergabe Odenthal"


def test_load_rows_keeps_one_best_portal_per_municipality(tmp_path: Path) -> None:
    first = tmp_path / "a.jsonl"
    first.write_text(
        "\n".join(
            [
                json.dumps(
                    {
                        "ags": "05378024",
                        "city": "Odenthal",
                        "links": [
                            {"url": "https://x/de", "vendor": None, "supported": False},
                            {"url": "https://y/select2", "vendor": "tevis", "supported": True},
                        ],
                    }
                ),
                json.dumps({"ags": "05378004", "city": "Bergisch Gladbach", "links": []}),
                json.dumps(
                    {
                        "ags": "",
                        "city": "Ohne Schlüssel",
                        "links": [{"url": "https://z", "vendor": "tevis", "supported": True}],
                    }
                ),
            ]
        ),
        encoding="utf-8",
    )
    rows = load_rows([str(first)])
    assert list(rows) == ["05378024"]
    # Links without a vendor are dropped, so the best one is what is kept.
    assert rows["05378024"]["link"]["vendor"] == "tevis"


async def test_a_portal_office_cannot_be_watched(
    client: AsyncClient, session: AsyncSession, auth_headers: dict[str, str]
) -> None:
    office = Office(
        provider=Provider.PORTAL,
        external_id="portal-05378024",
        base_url="https://termine.example.de",
        name="Terminvergabe Odenthal",
        city="Odenthal",
        booking_url="https://termine.example.de/",
        scan_enabled=False,
        scan_blocked_reason="Kein Adapter für tempus",
    )
    session.add(office)
    await session.flush()

    listed = await client.get("/api/v1/offices", params={"city": "Odenthal"})
    assert [o["name"] for o in listed.json()["items"]] == ["Terminvergabe Odenthal"]
    assert listed.json()["items"][0]["scan_enabled"] is False

    response = await client.post(
        "/api/v1/watches",
        headers=auth_headers,
        json={
            "label": "Perso Odenthal",
            "category": "personalausweis",
            "office_ids": [str(office.id)],
        },
    )
    assert response.status_code == 422
    assert "nicht überwacht werden" in response.json()["message"]
