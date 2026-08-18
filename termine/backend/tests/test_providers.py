"""Adapter tests run against captured HTML — no request leaves the machine."""

from __future__ import annotations

from datetime import UTC, date, datetime
from pathlib import Path

import httpx
import pytest

from app.core.errors import ProviderError
from app.models.enums import ServiceCategory
from app.providers import get_provider
from app.providers.base import OfficeRef, RawSlot, ServiceRef
from app.providers.berlin_zms import BerlinZmsProvider
from app.providers.demo import DemoProvider
from app.providers.html_utils import (
    extract_bookable_dates,
    extract_iso_datetimes,
    extract_time_slots,
)

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(autouse=True)
def _no_throttle(monkeypatch: pytest.MonkeyPatch) -> None:
    """Drop the politeness delay.

    The real 5s-per-host spacing is exactly right against a live authority and
    exactly wrong against a fixture: it would add half a minute to every run.
    """
    monkeypatch.setattr(BerlinZmsProvider, "min_request_interval", 0.0)

BERLIN_OFFICE = OfficeRef(
    external_id="122210",
    base_url="https://service.berlin.de",
    name="Bürgeramt Mitte",
    timezone="Europe/Berlin",
    meta={"services": [{"id": "120686", "name": "Anmeldung einer Wohnung"}]},
)
BERLIN_SERVICE = ServiceRef("120686", "Anmeldung einer Wohnung", ServiceCategory.ANMELDUNG)


def fixture(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")


def routed_client(routes: dict[str, str]) -> httpx.AsyncClient:
    """A client that serves captured pages by URL substring."""

    def handler(request: httpx.Request) -> httpx.Response:
        for marker, body in routes.items():
            if marker in str(request.url):
                return httpx.Response(200, text=body)
        return httpx.Response(404, text="not found")

    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


# --------------------------------------------------------------- Berlin ZMS


async def test_zms_reads_days_and_times_from_captured_html() -> None:
    provider = BerlinZmsProvider()
    async with routed_client(
        {"/termin/day/": fixture("zms_calendar.html"), "/termin/time/": fixture("zms_day.html")}
    ) as client:
        slots = await provider.fetch_slots(
            client, BERLIN_OFFICE, BERLIN_SERVICE, date(2026, 3, 1), date(2026, 3, 31)
        )

    # Two bookable days in the calendar, each served the same day fixture with
    # three free times and one taken.
    assert len(slots) == 6
    berlin_times = sorted({s.starts_at.astimezone(UTC).strftime("%H:%M") for s in slots})
    # 09:05 CET is 08:05 UTC.
    assert berlin_times == ["08:05", "08:25", "12:40"]
    assert all(s.provider_ref and s.provider_ref.startswith("https://service.berlin.de") for s in slots)


async def test_zms_ignores_opening_hours_and_nav_links() -> None:
    """Clock times that are not appointments must not become fake slots."""
    provider = BerlinZmsProvider()
    slots = provider._parse_day(fixture("zms_day.html"), date(2026, 3, 3), BERLIN_OFFICE)
    assert "15:00" not in {s.starts_at.astimezone(UTC).strftime("%H:%M") for s in slots}
    assert len(slots) == 3


async def test_zms_respects_the_requested_window() -> None:
    provider = BerlinZmsProvider()
    async with routed_client(
        {"/termin/day/": fixture("zms_calendar.html"), "/termin/time/": fixture("zms_day.html")}
    ) as client:
        slots = await provider.fetch_slots(
            client, BERLIN_OFFICE, BERLIN_SERVICE, date(2026, 3, 5), date(2026, 3, 31)
        )
    # Only the 7 March day falls inside the window; 3 March is filtered out.
    assert len(slots) == 3


async def test_zms_raises_when_the_page_shape_changes() -> None:
    """Silence must not be mistaken for "no appointments available"."""
    provider = BerlinZmsProvider()

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, text="<html><body><h1>Wartung</h1></body></html>")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(ProviderError):
            await provider.fetch_slots(
                client, BERLIN_OFFICE, BERLIN_SERVICE, date(2026, 3, 1), date(2026, 3, 31)
            )


async def test_zms_reports_transport_failure_as_provider_error() -> None:
    provider = BerlinZmsProvider()

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection refused")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        with pytest.raises(ProviderError):
            await provider.fetch_slots(
                client, BERLIN_OFFICE, BERLIN_SERVICE, date(2026, 3, 1), date(2026, 3, 31)
            )


def test_zms_booking_url_prefers_the_exact_time_link() -> None:
    provider = BerlinZmsProvider()
    slot = RawSlot(
        starts_at=datetime(2026, 3, 3, 8, 5, tzinfo=UTC),
        provider_ref="https://service.berlin.de/terminvereinbarung/termin/form/?ts=1772688300",
    )
    assert provider.booking_url(BERLIN_OFFICE, BERLIN_SERVICE, slot) == slot.provider_ref

    bare = RawSlot(starts_at=datetime(2026, 3, 3, 8, 5, tzinfo=UTC))
    fallback = provider.booking_url(BERLIN_OFFICE, BERLIN_SERVICE, bare)
    assert "dienstleisterlist=122210" in fallback
    assert "120686" in fallback


async def test_zms_services_come_from_the_catalogue() -> None:
    provider = BerlinZmsProvider()
    async with httpx.AsyncClient() as client:
        services = await provider.discover_services(client, BERLIN_OFFICE)
    assert [s.external_id for s in services] == ["120686"]
    assert services[0].category == ServiceCategory.ANMELDUNG


# --------------------------------------------------------------- HTML utils


def test_extract_time_slots_needs_a_link() -> None:
    html = """
    <div>
      <a href="/suggest?date=2026-03-03&time=0900">09:00</a>
      <span>10:00</span>
      <a href="/impressum">Impressum</a>
    </div>
    """
    slots = extract_time_slots(
        html, date(2026, 3, 3), "Europe/Berlin", base_url="https://x.invalid", href_must_contain="suggest"
    )
    assert len(slots) == 1
    assert slots[0].starts_at == datetime(2026, 3, 3, 8, 0, tzinfo=UTC)


def test_extract_time_slots_deduplicates() -> None:
    html = '<a href="/suggest?a">09:00</a><a href="/suggest?b">09:00</a>'
    slots = extract_time_slots(
        html, date(2026, 3, 3), "Europe/Berlin", base_url="https://x.invalid", href_must_contain="suggest"
    )
    assert len(slots) == 1


def test_extract_bookable_dates_uses_hints_when_present() -> None:
    # Wrapped in a real table: an HTML5 parser discards <td> elements that
    # are not inside one, taking their classes with them.
    html = """
    <table><tr>
      <td class="ekbBookable"><a href="?date=2026-03-04">4</a></td>
      <td class="ekbBlocked"><a href="?date=2026-03-05">5</a></td>
    </tr></table>
    """
    assert extract_bookable_dates(html, class_hints=("ekbBookable",)) == [date(2026, 3, 4)]


def test_extract_bookable_dates_degrades_to_all_dates() -> None:
    """A redesigned calendar should mean "check every day", not "nothing free"."""
    html = '<table><tr><td><a href="?date=2026-03-04">4</a></td><td><a href="?date=2026-03-05">5</a></td></tr></table>'
    assert extract_bookable_dates(html, class_hints=("ekbBookable",)) == [
        date(2026, 3, 4),
        date(2026, 3, 5),
    ]


def test_extract_iso_datetimes() -> None:
    html = '<script>var slots = ["2026-03-04T09:15", "2026-03-04T09:15", "2026-03-05T11:00"];</script>'
    slots = extract_iso_datetimes(html, "Europe/Berlin")
    assert [s.starts_at.astimezone(UTC).isoformat() for s in slots] == [
        "2026-03-04T08:15:00+00:00",
        "2026-03-05T10:00:00+00:00",
    ]


# --------------------------------------------------------------------- demo


async def test_demo_provider_is_deterministic_and_weekday_only() -> None:
    provider = DemoProvider()
    office = OfficeRef("demo-x", "https://demo.invalid", "Demo", booking_url="https://demo.invalid/t")
    service = ServiceRef("demo-perso", "Personalausweis", ServiceCategory.PERSONALAUSWEIS)

    async with httpx.AsyncClient() as client:
        first = await provider.fetch_slots(client, office, service, date(2026, 3, 1), date(2026, 4, 30))
        second = await provider.fetch_slots(client, office, service, date(2026, 3, 1), date(2026, 4, 30))

    assert [s.starts_at for s in first] == [s.starts_at for s in second]
    assert first, "the demo provider should produce some availability over two months"
    # Ämter are shut at the weekend, and the demo should not pretend otherwise.
    assert all(s.starts_at.weekday() < 5 for s in first)


def test_registry_resolves_every_provider() -> None:
    for key in ("demo", "berlin_zms", "tevis", "netappoint", "etermin"):
        assert get_provider(key).key == key


def test_registry_rejects_unknown_provider() -> None:
    with pytest.raises(ProviderError):
        get_provider("does_not_exist")
