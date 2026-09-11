"""Re-labelling a survey that has already been collected.

The survey assigns a vendor from the URL *or* from the page body, and the body
is not kept. That asymmetry is the whole difficulty: a URL-only pass can widen
a signature but never tighten one, because a label it cannot re-derive looks
identical whether it came from a body it can no longer see or from a pattern
that has since been fixed. Getting it wrong in either direction is expensive —
keeping phantoms invents offices, clearing real ones loses them.
"""

from __future__ import annotations

import httpx
import pytest

from app.providers.robots import robots
from scripts.reclassify import VIA_BODY, VIA_URL, reclassify_by_url, unexplained, verify


@pytest.fixture(autouse=True)
def _clear_cache() -> None:
    robots.clear()


def row(*links: dict, status: str = "unbekannt") -> dict:
    return {"city": "Musterstadt", "status": status, "links": list(links)}


def test_a_url_pass_applies_a_widened_signature() -> None:
    """The hyphenless Bavarian host was invisible until the pattern grew."""
    rows = [row({"url": "https://www.buergerserviceportal.de/bayern/landshut/home"})]
    changes, touched = reclassify_by_url(rows)

    assert touched == 1
    assert rows[0]["links"][0]["vendor"] == "bayern-portal"
    assert rows[0]["links"][0]["via"] == VIA_URL
    assert rows[0]["status"] == "bayern-portal"
    assert changes["— → bayern-portal"] == 1


def test_a_url_pass_leaves_a_label_it_cannot_re_derive() -> None:
    """Lüneburg's page says TEVISWEB; its URL says nothing at all.

    Clearing this would delete a real office on the strength of no evidence,
    which is why the URL pass is not allowed to clear anything.
    """
    rows = [row({"url": "https://www.landkreis-lueneburg.de/", "vendor": "tevis", "supported": True})]
    _, touched = reclassify_by_url(rows)

    assert touched == 0
    assert rows[0]["links"][0]["vendor"] == "tevis"
    assert unexplained(rows[0]) == rows[0]["links"]


def test_a_label_the_url_does_explain_is_never_re_fetched() -> None:
    """Almost every label is explained by its URL, which is what keeps
    ``--verify`` to a couple of hundred requests rather than eleven thousand."""
    rows = [row({"url": "https://termine.stadt-koeln.de/select2?md=1", "vendor": "tevis"})]
    reclassify_by_url(rows)

    assert rows[0]["links"][0]["via"] == VIA_URL
    assert unexplained(rows[0]) == []


async def test_verify_clears_a_label_the_page_does_not_support() -> None:
    """Coburg's CMS page was read as Berlin's booking software.

    The URL cannot settle it — that is why the page is fetched. The page
    mentions no vendor, so the label goes.
    """
    rows = [
        row(
            {
                "url": "https://www.coburg.de/rathaus/terminvereinbarung/termin-vereinbaren.php",
                "vendor": "berlin_zms",
                "supported": True,
            },
            status="berlin_zms",
        )
    ]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(200, text="<html><body>Bitte rufen Sie uns an.</body></html>")

    changes, touched = await _verify(rows, handler)

    assert touched == 1
    assert rows[0]["links"][0]["vendor"] is None
    assert rows[0]["links"][0]["supported"] is False
    assert rows[0]["links"][0]["via"] == VIA_BODY
    assert rows[0]["status"] == "kein Terminsystem verlinkt"
    assert changes["berlin_zms → —"] == 1


async def test_verify_keeps_a_label_the_page_confirms() -> None:
    rows = [row({"url": "https://www.landkreis-lueneburg.de/", "vendor": "tevis", "supported": True})]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(200, text="<html><body>TEVISWEB Terminvergabe</body></html>")

    _, touched = await _verify(rows, handler)

    assert touched == 0
    assert rows[0]["links"][0]["vendor"] == "tevis"
    assert rows[0]["links"][0]["via"] == VIA_BODY


async def test_verify_corrects_a_label_to_what_the_page_actually_runs() -> None:
    rows = [row({"url": "https://www.landkreis-bamberg.de/Terminvereinbarung/", "vendor": "berlin_zms"})]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(200, text='<iframe src="https://satellite.booking-time.com/?key=x">')

    _, touched = await _verify(rows, handler)

    assert touched == 1
    assert rows[0]["links"][0]["vendor"] == "bookingtime"


async def test_an_unreadable_page_changes_nothing() -> None:
    """A host that is down is no evidence, and must cost nobody their entry."""
    rows = [row({"url": "https://www.example.de/termine", "vendor": "tevis", "supported": True})]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            return httpx.Response(404)
        return httpx.Response(502, text="")

    _, touched = await _verify(rows, handler)

    assert touched == 0
    assert rows[0]["links"][0]["vendor"] == "tevis"
    # Nothing was learned, so the link stays on the list to be asked about again.
    assert unexplained(rows[0]) == rows[0]["links"]


async def test_a_page_we_may_not_read_changes_nothing() -> None:
    """robots.txt outranks the wish to check a label."""
    rows = [row({"url": "https://www.example.de/termine", "vendor": "tevis", "supported": True})]

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/robots.txt":
            return httpx.Response(200, text="User-agent: *\nDisallow: /\n")
        raise AssertionError("the page must not be fetched")

    _, touched = await _verify(rows, handler)

    assert touched == 0
    assert rows[0]["links"][0]["vendor"] == "tevis"


async def _verify(rows: list[dict], handler) -> tuple:
    """Run the verify pass against a mock transport."""
    import scripts.reclassify as module

    real = httpx.AsyncClient

    class Patched(real):  # type: ignore[misc,valid-type]
        def __init__(self, **kwargs: object) -> None:
            kwargs.pop("transport", None)
            super().__init__(transport=httpx.MockTransport(handler), **kwargs)  # type: ignore[arg-type]

    module.httpx.AsyncClient = Patched  # type: ignore[misc]
    try:
        return await verify(rows, concurrency=2)
    finally:
        module.httpx.AsyncClient = real  # type: ignore[misc]
