"""Build the Bremen office catalogue from the state's own service portal.

Bremen is the smallest Bundesland and the first one catalogued. Its portal,
``service.bremen.de``, publishes two listings that are exactly what a catalogue
needs — every authority that offers appointment booking, and every service that
can be booked — and its ``robots.txt`` is empty, so reading them is allowed.

    python -m scripts.discover_bremen            # print a summary
    python -m scripts.discover_bremen --json out.json

**This script reads the portal, never the booking system.** Bremen's booking
system (``termin.bremen.de``, a TEVIS instance) publishes ``Disallow: /`` for
every agent, and its API answers "Zutritt verweigert!" without credentials. So
the catalogue records the mandant ids needed to poll it one day, and marks
every office ``scan_enabled=False`` until Bremen grants access. See
``docs/legal.md``.
"""

from __future__ import annotations

import argparse
import asyncio
import html
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from urllib.parse import parse_qs, urlparse

import httpx
from selectolax.parser import HTMLParser

from app.providers.base import build_client
from app.providers.robots import robots
from app.providers.taxonomy import classify_authority, classify_service

PORTAL = "https://www.service.bremen.de"
#: The portal's two curated listings, addressed by their CMS ids.
OFFICES_GSID = "bremen134.c.201782.de"
SERVICES_GSID = "bremen134.c.201784.de"
#: One request per listing instead of paging ten at a time.
PAGE_MAX = 500

_COUNT_RE = re.compile(r"Die Suche ergab (\d+) Treffer")
#: `Katharinenklosterhof 3, 28195 Bremen` -> street, postcode, city.
_ADDRESS_RE = re.compile(r"^(?P<street>.*?),\s*(?P<zip>\d{5})\s+(?P<city>.+)$")


@dataclass
class DiscoveredOffice:
    external_id: str
    name: str
    street: str | None
    postal_code: str | None
    city: str
    authority_type: str
    detail_url: str
    booking_url: str | None
    mandant: str | None
    services: list[str] = field(default_factory=list)


def _text(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def _listing_url(gsid: str) -> str:
    return f"{PORTAL}/sixcms/detail.php?gsid={gsid}&max={PAGE_MAX}"


async def _fetch(client: httpx.AsyncClient, url: str) -> str:
    verdict = await robots.allowed(client, url)
    if not verdict.allowed:
        raise SystemExit(f"robots.txt forbids reading {url} — aborting rather than proceeding")
    response = await client.get(url)
    response.raise_for_status()
    return response.text


def _parse_items(page: str) -> list[tuple[str, str]]:
    """Return (data-id, inner HTML) for every result item.

    Parsed rather than regexed: a service entry nests its own ``<ul>`` of
    "Lebenslagen" icons inside the result item, so any regex for the enclosing
    list stops at the first nested ``</ul>`` and finds exactly one of the 72
    services. Only the outer items carry ``search-result-item``, so the class
    selector picks them cleanly.
    """
    tree = HTMLParser(page)
    container = tree.css_first("#search-results")
    if container is None:
        raise SystemExit("portal listing had no #search-results — the page shape changed")

    items: list[tuple[str, str]] = []
    for node in container.css("li.search-result-item"):
        data_id = node.attributes.get("data-id")
        if data_id:
            items.append((data_id, node.html or ""))
    return items


def _expected_count(page: str) -> int | None:
    match = _COUNT_RE.search(_text(page))
    return int(match.group(1)) if match else None


def parse_offices(page: str) -> list[DiscoveredOffice]:
    offices: list[DiscoveredOffice] = []
    for data_id, body in _parse_items(page):
        name_match = re.search(r'class="dienststellen"[^>]*>([^<]+)<', body)
        if not name_match:
            continue
        name = html.unescape(name_match.group(1)).strip()

        address = ""
        address_match = re.search(r'class="description"[^>]*>(.*?)</p>', body, re.S)
        if address_match:
            address = _text(address_match.group(1))
        parts = _ADDRESS_RE.match(address)

        links = [html.unescape(h) for h in re.findall(r'href="([^"]+)"', body)]
        detail = next((link for link in links if "/behoerden" in link or data_id in link), "")
        booking = next((link for link in links if "termin.bremen.de" in link), None)
        mandant = None
        if booking:
            mandant = (parse_qs(urlparse(booking).query).get("md") or [None])[0]

        offices.append(
            DiscoveredOffice(
                external_id=data_id,
                name=name,
                street=parts.group("street") if parts else None,
                postal_code=parts.group("zip") if parts else None,
                city=parts.group("city") if parts else "Bremen",
                authority_type=str(classify_authority(name)),
                detail_url=detail,
                booking_url=booking,
                mandant=mandant,
            )
        )
    return offices


def parse_services(page: str) -> list[dict]:
    services: list[dict] = []
    for data_id, body in _parse_items(page):
        name_match = re.search(r'class="dienstleistungen"[^>]*>([^<]+)<', body)
        if not name_match:
            continue
        name = html.unescape(name_match.group(1)).strip()
        services.append(
            {"external_id": data_id, "name": name, "category": str(classify_service(name))}
        )
    return services


async def discover() -> dict:
    async with build_client() as client:
        offices_page = await _fetch(client, _listing_url(OFFICES_GSID))
        offices = parse_offices(offices_page)
        expected_offices = _expected_count(offices_page)

        services_page = await _fetch(client, _listing_url(SERVICES_GSID))
        services = parse_services(services_page)
        expected_services = _expected_count(services_page)

    # A silent shortfall here would look like "Bremen shrank" rather than "the
    # parser broke", so it is reported rather than swallowed.
    for label, got, expected in (
        ("offices", len(offices), expected_offices),
        ("services", len(services), expected_services),
    ):
        if expected is not None and got != expected:
            print(f"WARNING: parsed {got} {label} but the page reports {expected}", file=sys.stderr)

    return {
        "source": PORTAL,
        "state": "Bremen",
        "offices": [asdict(o) for o in offices],
        "services": services,
    }


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", metavar="PATH", help="write the full result as JSON")
    args = parser.parse_args()

    result = await discover()

    if args.json:
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump(result, handle, ensure_ascii=False, indent=2)
        print(f"wrote {args.json}")

    offices = result["offices"]
    print(f"\n{len(offices)} Behörden mit Terminbuchung, {len(result['services'])} Dienstleistungen\n")
    for office in sorted(offices, key=lambda o: o["name"]):
        mandant = f"md={office['mandant']}" if office["mandant"] else "kein Buchungslink"
        print(f"  {mandant:>16}  {office['name'][:58]:60} {office['postal_code'] or '':>6} {office['city']}")

    without = [o for o in offices if not o["mandant"]]
    if without:
        print(f"\n{len(without)} ohne Buchungslink: {[o['name'] for o in without]}")


if __name__ == "__main__":
    asyncio.run(main())
