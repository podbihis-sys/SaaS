"""robots.txt is the rule that decides whether an office may be polled at all.

Bremen is the case that forced this: its booking system publishes
``Disallow: /`` for every agent, so no adapter may poll it however correct the
adapter is. A rule that depends on somebody remembering it is not a rule, so it
lives in the scan path and is tested there.
"""

from __future__ import annotations

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Office, Service
from app.models.enums import ScanStatus
from app.models.slot import ScanRun
from app.providers.base import OfficeRef
from app.providers.robots import robots
from app.providers.tevis import TevisProvider
from app.services.scanner import due_pairs, scan_pair


@pytest.fixture(autouse=True)
def _clear_cache() -> None:
    robots.clear()


def client_serving(robots_txt: str | None, status: int = 200) -> httpx.AsyncClient:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            if robots_txt is None:
                return httpx.Response(404, text="not found")
            return httpx.Response(status, text=robots_txt)
        return httpx.Response(200, text="<html><body>suggest cnc-1</body></html>")

    return httpx.AsyncClient(transport=httpx.MockTransport(handler))


async def test_blanket_disallow_is_refused() -> None:
    """Exactly what termin.bremen.de publishes."""
    async with client_serving("User-agent: *\nDisallow: /\n") as client:
        verdict = await robots.allowed(client, "https://termin.bremen.de/termine")
    assert verdict.allowed is False


async def test_empty_robots_allows() -> None:
    """service.bremen.de serves a one-byte file, which restricts nothing."""
    async with client_serving("\n") as client:
        verdict = await robots.allowed(client, "https://www.service.bremen.de/anything")
    assert verdict.allowed is True


async def test_missing_robots_allows() -> None:
    async with client_serving(None) as client:
        verdict = await robots.allowed(client, "https://example.invalid/x")
    assert verdict.allowed is True


async def test_rule_naming_us_is_not_overruled_by_a_permissive_wildcard() -> None:
    """A group naming our agent wins over `*`, not the other way round."""
    async with client_serving("User-agent: TerminRadar\nDisallow: /\n\nUser-agent: *\nAllow: /\n") as client:
        verdict = await robots.allowed(client, "https://example.invalid/x")
    assert verdict.allowed is False


async def test_partial_disallow_respects_the_path() -> None:
    async with client_serving("User-agent: *\nDisallow: /termine\n") as client:
        blocked = await robots.allowed(client, "https://example.invalid/termine/suggest")
        allowed = await robots.allowed(client, "https://example.invalid/public/info")
    assert blocked.allowed is False
    assert allowed.allowed is True


async def test_robots_is_fetched_once_per_host() -> None:
    """Twenty Bremen offices share one host and must not cause twenty fetches."""
    calls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request.url.path)
        return httpx.Response(200, text="User-agent: *\nDisallow: /\n")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        for _ in range(5):
            await robots.allowed(client, "https://termin.bremen.de/termine")

    assert calls.count("/robots.txt") == 1


async def test_scan_refuses_a_disallowed_office_and_disables_it(
    session: AsyncSession, office: Office, service: Service
) -> None:
    """The scan must stop before the adapter runs, and record why."""
    async with client_serving("User-agent: *\nDisallow: /\n") as client:
        result = await scan_pair(session, office, service, client)

    assert result.ok is False
    assert office.scan_enabled is False
    assert "robots" in (office.scan_blocked_reason or "").lower()

    run = (await session.execute(select(ScanRun))).scalars().one()
    assert run.status == ScanStatus.ERROR


async def test_due_pairs_skips_offices_that_may_not_be_scanned(
    session: AsyncSession, office: Office, service: Service, user, monkeypatch: pytest.MonkeyPatch
) -> None:
    from app.models.enums import ServiceCategory
    from app.models.watch import Watch

    watch = Watch(user_id=user.id, label="X", category=ServiceCategory.PERSONALAUSWEIS)
    watch.offices = [office]
    session.add(watch)
    await session.flush()

    assert await due_pairs(session) != []

    office.scan_enabled = False
    await session.flush()
    assert await due_pairs(session) == []


def test_tevis_honours_an_instance_path_prefix() -> None:
    """Bremen serves TEVIS at /termine/, not at the host root.

    `urljoin(base, "/select2")` drops the prefix because the leading slash
    resets the path, which would have requested the wrong URL entirely.
    """
    provider = TevisProvider()
    bremen = OfficeRef("5", "https://termin.bremen.de/termine", "BSC", meta={"mandant": "5"})
    assert provider._endpoint(bremen, "select2") == "https://termin.bremen.de/termine/select2"

    trailing = OfficeRef("5", "https://termin.bremen.de/termine/", "BSC", meta={"mandant": "5"})
    assert provider._endpoint(trailing, "select2") == "https://termin.bremen.de/termine/select2"

    at_root = OfficeRef("1", "https://termine.stadt-koeln.de", "KZ", meta={"mandant": "1"})
    assert provider._endpoint(at_root, "suggest") == "https://termine.stadt-koeln.de/suggest"
