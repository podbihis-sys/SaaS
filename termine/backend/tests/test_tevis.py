"""The TEVIS flow, against pages captured from a live instance.

TEVIS is the system most German municipalities use, and the adapter's original
assumption about it was wrong: it requested ``/suggest`` with the selection in
the query string, which every instance answers with "Kein gültiger Standort
gefunden". The booking lives in a server-side session, so the flow has to be
walked — entry page, location page, location POST — and the fixtures here are
the three pages a real instance returned during that walk.
"""

from __future__ import annotations

from datetime import UTC, date, datetime
from pathlib import Path

import httpx
import pytest

from app.core.errors import ProviderError
from app.models.enums import ServiceCategory
from app.providers.base import OfficeRef, ServiceRef
from app.providers.tevis import TevisProvider

FIXTURES = Path(__file__).parent / "fixtures"
SELECT2 = (FIXTURES / "tevis_select2.html").read_text(encoding="utf-8")
LOCATION = (FIXTURES / "tevis_location.html").read_text(encoding="utf-8")
SUGGEST = (FIXTURES / "tevis_suggest.html").read_text(encoding="utf-8")

OFFICE = OfficeRef(
    external_id="tevis-duesseldorf-md27",
    base_url="https://termine.example.de",
    name="Amt für Soziales und Jugend",
    timezone="Europe/Berlin",
    meta={"mandant": "27"},
)
SERVICE = ServiceRef(external_id="5909", name="Erstberatung", category=ServiceCategory.SONSTIGES)


def flow_client(*, suggest: str = SUGGEST, seen: list[httpx.Request] | None = None) -> httpx.AsyncClient:
    def handler(request: httpx.Request) -> httpx.Response:
        if seen is not None:
            seen.append(request)
        path = request.url.path
        if path.endswith("/select2"):
            return httpx.Response(200, text=SELECT2)
        if path.endswith("/location"):
            if request.method == "POST":
                return httpx.Response(200, text=suggest)
            return httpx.Response(200, text=LOCATION)
        if path.endswith("/suggest"):
            return httpx.Response(200, text=suggest)
        return httpx.Response(404, text="")

    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


@pytest.fixture(autouse=True)
def _no_throttle(monkeypatch: pytest.MonkeyPatch) -> None:
    """The adapter waits four seconds between requests; tests need not."""

    async def instant(self, url: str) -> None:  # noqa: ANN001
        return None

    monkeypatch.setattr(TevisProvider, "throttle", instant)


async def test_services_are_read_from_the_entry_page() -> None:
    async with flow_client() as client:
        services = await TevisProvider().discover_services(client, OFFICE)
    by_id = {s.external_id: s.name for s in services}
    assert by_id["5909"].startswith("Erstberatung")
    assert "5910" in by_id


async def test_the_flow_is_walked_in_order_with_the_internal_mandant() -> None:
    """The entry page's hidden `mdt` is the id the rest of the flow needs."""
    seen: list[httpx.Request] = []
    async with flow_client(seen=seen) as client:
        await TevisProvider().fetch_slots(client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 30))

    steps = [(r.method, r.url.path) for r in seen]
    assert steps[:3] == [
        ("GET", "/select2"),
        ("GET", "/location"),
        ("POST", "/location"),
    ]
    # The public selector is 27; the form on the page submits 415.
    assert seen[0].url.params["md"] == "27"
    assert seen[1].url.params["mdt"] == "415"
    assert seen[1].url.params["cnc-5909"] == "1"
    assert b"loc=380" in seen[2].content
    assert b"select_location" in seen[2].content


async def test_suggestions_become_slots_in_utc() -> None:
    async with flow_client() as client:
        slots = await TevisProvider().fetch_slots(
            client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 30)
        )

    assert len(slots) == 16
    first = slots[0]
    # 09:00 local on 18 September is 07:00 UTC — Berlin is on CEST then.
    assert first.starts_at == datetime(2026, 9, 18, 7, 0, tzinfo=UTC)
    assert first.ends_at == datetime(2026, 9, 18, 8, 0, tzinfo=UTC)
    assert slots == sorted(slots, key=lambda s: s.starts_at)


async def test_slots_outside_the_window_are_dropped() -> None:
    async with flow_client() as client:
        slots = await TevisProvider().fetch_slots(
            client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 21)
        )
    assert {s.starts_at.date() for s in slots} == {date(2026, 9, 18), date(2026, 9, 21)}


async def test_an_unrecognisable_page_raises_rather_than_reporting_nothing_free() -> None:
    """The failure mode that matters: silence looks exactly like "no appointments"."""
    error_page = "<html><body><h1>Fehler</h1><p>Kein gültiger Standort gefunden.</p></body></html>"
    async with flow_client(suggest=error_page) as client:
        with pytest.raises(ProviderError):
            await TevisProvider().fetch_slots(client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 30))


async def test_an_empty_suggestion_page_is_reported_as_empty() -> None:
    """A page that *is* the suggestions step and lists none means none."""
    empty = '<html><body><form action="" method="get" id="suggest_filter_form"></form></body></html>'
    async with flow_client(suggest=empty) as client:
        slots = await TevisProvider().fetch_slots(
            client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 30)
        )
    assert slots == []


async def test_a_location_page_without_a_branch_raises() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/select2"):
            return httpx.Response(200, text=SELECT2)
        return httpx.Response(200, text="<html><body>keine Standorte</body></html>")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(ProviderError, match="branch"):
            await TevisProvider().fetch_slots(client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 30))


async def test_handoff_opens_the_offices_own_flow() -> None:
    slot = (await _one_slot())[0]
    url = TevisProvider().booking_url(OFFICE, SERVICE, slot)
    # Not a link into our session: the user starts their own.
    assert url == "https://termine.example.de/select2?md=27"


async def _one_slot():  # noqa: ANN202
    async with flow_client() as client:
        return await TevisProvider().fetch_slots(client, OFFICE, SERVICE, date(2026, 9, 8), date(2026, 9, 30))


async def test_an_instance_mounted_under_a_prefix_keeps_it() -> None:
    """Bremen and the shared data-centre instances live below the root."""
    seen: list[httpx.Request] = []
    office = OfficeRef(
        external_id="x",
        base_url="https://tevis.example.de/tevisweb360",
        name="Kreis",
        timezone="Europe/Berlin",
        meta={"mandant": "2"},
    )
    async with flow_client(seen=seen) as client:
        await TevisProvider().fetch_slots(client, office, SERVICE, date(2026, 9, 8), date(2026, 9, 30))
    assert all(r.url.path.startswith("/tevisweb360/") for r in seen)
