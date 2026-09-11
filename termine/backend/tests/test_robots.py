"""robots.txt is the rule that decides whether an office may be polled at all.

Bremen is the case that forced this: its booking system publishes
``Disallow: /`` for every agent, so no adapter may poll it however correct the
adapter is. A rule that depends on somebody remembering it is not a rule, so it
lives in the scan path and is tested there.
"""

from __future__ import annotations

from pathlib import Path

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Office, Service
from app.models.enums import ScanStatus
from app.models.slot import ScanRun
from app.providers.base import OfficeRef
from app.providers.robots import RobotsRules, robots
from app.providers.tevis import TevisProvider
from app.services.scanner import due_pairs, scan_pair

FIXTURES = Path(__file__).parent / "fixtures"


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


BERLIN = (FIXTURES / "berlin_robots.txt").read_text(encoding="utf-8")


def test_berlin_file_is_read_correctly() -> None:
    """The verbatim service.berlin.de robots.txt.

    This is the file that exposed the bug: the standard-library parser treats
    `Disallow: /standort/*/pdf/` as a literal prefix, so it matched nothing and
    the file read as more permissive than it is.
    """
    rules = RobotsRules(BERLIN)
    # The booking flow the adapter would use is explicitly forbidden.
    assert rules.allowed("TerminRadar", "/terminvereinbarung/termin/day/") is False
    assert rules.allowed("TerminRadar", "/terminvereinbarung/termin/time/1772492400/") is False
    assert rules.allowed("TerminRadar", "/terminvereinbarung/api") is False
    # Wildcard rules must actually match.
    assert rules.allowed("TerminRadar", "/standort/122210/pdf/") is False
    assert rules.allowed("TerminRadar", "/dienstleistung/120686/standort/122210/pdf/") is False
    # The catalogue pages themselves are allowed, which is how a catalogue
    # could still be built from Berlin's public listings.
    assert rules.allowed("TerminRadar", "/standort/122210/") is True
    assert rules.allowed("TerminRadar", "/dienstleistung/120686/") is True


def test_wildcard_matches_any_run_of_characters() -> None:
    rules = RobotsRules("User-agent: *\nDisallow: /a/*/c\n")
    assert rules.allowed("x", "/a/b/c") is False
    assert rules.allowed("x", "/a/anything/at/all/c") is False
    assert rules.allowed("x", "/a/c") is True


def test_dollar_anchors_the_end() -> None:
    rules = RobotsRules("User-agent: *\nDisallow: /*.pdf$\n")
    assert rules.allowed("x", "/file.pdf") is False
    assert rules.allowed("x", "/file.pdf?download=1") is True


def test_longest_matching_rule_wins() -> None:
    """`Allow: /public/` inside `Disallow: /` must win for /public/x."""
    rules = RobotsRules("User-agent: *\nDisallow: /\nAllow: /public/\n")
    assert rules.allowed("x", "/private") is False
    assert rules.allowed("x", "/public/page") is True


def test_allow_beats_disallow_on_a_tie() -> None:
    rules = RobotsRules("User-agent: *\nDisallow: /p\nAllow: /p\n")
    assert rules.allowed("x", "/p/x") is True


def test_empty_disallow_means_allow_everything() -> None:
    rules = RobotsRules("User-agent: *\nDisallow:\n")
    assert rules.allowed("x", "/anything") is True


def test_group_naming_us_is_used_even_when_wildcard_is_looser() -> None:
    rules = RobotsRules("User-agent: TerminRadar\nDisallow: /\n\nUser-agent: *\nAllow: /\n")
    assert rules.allowed("TerminRadar", "/x") is False
    assert rules.allowed("SomeoneElse", "/x") is True


def test_comments_and_blank_lines_are_ignored() -> None:
    rules = RobotsRules("# a comment\n\nUser-agent: *  # trailing\nDisallow: /x # here\n")
    assert rules.allowed("x", "/x") is False
    assert rules.allowed("x", "/y") is True


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


async def test_a_server_error_blocks_rather_than_permits() -> None:
    """RFC 9309 §2.3.1.4: rules that cannot be read mean "assume disallowed"."""
    async with client_serving("User-agent: *\nAllow: /\n", status=503) as client:
        verdict = await robots.allowed(client, "https://example.invalid/select2")
    assert verdict.allowed is False
    assert "RFC 9309" in verdict.reason


async def test_an_outage_does_not_strike_the_office_out_of_the_catalogue(
    session: AsyncSession, office: Office, service: Service
) -> None:
    """A bad gateway stops the scan; it must not disable the office.

    The two "do not fetch" cases pull in opposite directions: a Disallow is a
    decision by the authority and should stick, while an unreadable file is
    usually over in minutes. Before this distinction existed, one 502 would
    have removed the office until somebody re-seeded the catalogue by hand.
    """

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            return httpx.Response(502, text="")
        return httpx.Response(200, text="<html></html>")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await scan_pair(session, office, service, client)

    assert result.ok is False
    assert office.scan_enabled is True
    assert office.scan_blocked_reason is None


async def test_an_unreachable_host_blocks_rather_than_permits() -> None:
    calls: list[int] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(1)
        raise httpx.ConnectError("no route to host")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        verdict = await robots.allowed(client, "https://example.invalid/select2")
    assert verdict.allowed is False
    # A name that does not resolve resolves no better a second later, and a
    # survey guessing a dozen hostnames per municipality pays that wait on
    # each one. Only a timeout or a server error is worth a second attempt.
    assert len(calls) == 1


async def test_an_outage_is_re_checked_soon_rather_than_cached_all_day() -> None:
    """A blocked verdict from an outage must not outlive the outage."""
    calls: list[int] = []
    fail = True

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(1)
        if fail:
            return httpx.Response(500, text="")
        return httpx.Response(200, text="User-agent: *\nAllow: /\n")

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        first = await robots.allowed(client, "https://example.invalid/select2")
        assert first.allowed is False
        # One retry before giving up: a dropped connection is far commoner
        # than a host that is really refusing.
        assert len(calls) == 2

        # Nothing re-fetches within the short window …
        await robots.allowed(client, "https://example.invalid/select2")
        assert len(calls) == 2

        # … but the entry expires far sooner than a parsed file would.
        from app.providers import robots as robots_module

        rules, outcome, fetched = robots_module.robots._rules["https://example.invalid"]
        robots_module.robots._rules["https://example.invalid"] = (
            rules,
            outcome,
            fetched - robots_module._UNAVAILABLE_TTL_SECONDS - 1,
        )
        fail = False
        second = await robots.allowed(client, "https://example.invalid/select2")

    assert second.allowed is True
    assert len(calls) == 3


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
