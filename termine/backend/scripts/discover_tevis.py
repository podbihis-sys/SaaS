"""Find the offices behind every TEVIS instance the city survey cleared.

The survey (`scripts/survey_cities.py`) establishes *that* a city runs TEVIS
and that its robots.txt permits polling. This script reads the instance's
landing page — one request per host, robots-checked with the production
matcher first — and pulls out every ``select2?md=<mandant>`` link together
with its label. Each mandant is one bookable office, which is exactly the row
the catalogue needs.

    python -m scripts.discover_tevis --survey survey.json --json offices.json

Shared instances are handled by path prefix: `tevis.ekom21.de/fra/select2`
belongs to Frankfurt, so the base URL kept for each office includes the
prefix, and the TEVIS adapter joins paths onto that base without dropping it —
the bug Bremen exposed. Only confirmed prefixes are used (see
``EKOM21_LANDINGS``); the instance's root refuses and guessed prefixes 404.

A landing page that yields no mandant links is reported, not silently skipped:
Köln's instance answers 400 to everything without a valid ``md``, and the same
pattern will recur. Those cities stay "reachable, offices not enumerable" until
someone finds their mandant ids by another route.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from dataclasses import asdict, dataclass
from urllib.parse import parse_qs, urljoin, urlparse

import httpx
from selectolax.parser import HTMLParser

from app.providers.base import build_client
from app.providers.robots import robots

#: Confirmed landings on the shared ekom21 instance, by path prefix.
#:
#: The instance answers 403 at its root and 404 for guessed prefixes — `/wi/`,
#: `/ks/` and `/da/` do not exist, so Wiesbaden, Kassel and Darmstadt are not
#: here. A city's real prefix has to come from its own portal, the way `/fra/`
#: did. Guessing further would be probing, not discovery.
EKOM21_LANDINGS: dict[str, tuple[str, str]] = {
    "fra": ("Frankfurt am Main", "Hessen"),
    # Both came from the cities' own websites, the same way `/fra/` did —
    # found by the deep crawl, not guessed. Kassel and Offenbach block our
    # client on their main site, so their entry point had to come from a page
    # that does answer.
    "kas": ("Kassel", "Hessen"),
    "offkul": ("Offenbach am Main", "Hessen"),
}

_MD_RE = re.compile(r"select2\?.*\bmd=(\d+)", re.I)


@dataclass
class TevisOffice:
    city: str
    state: str
    host: str
    base_url: str
    mandant: str
    name: str
    booking_url: str


@dataclass
class HostOutcome:
    host: str
    city: str
    status: str
    offices: list[TevisOffice]


def _label_for(node) -> str:  # noqa: ANN001 - selectolax node
    """The link's own text, else the nearest heading above it."""
    text = (node.text() or "").strip()
    if len(text) > 2:
        return re.sub(r"\s+", " ", text)
    current = node.parent
    for _ in range(4):
        if current is None:
            break
        heading = current.css_first("h1, h2, h3, h4, strong, b")
        if heading and (heading.text() or "").strip():
            return re.sub(r"\s+", " ", heading.text().strip())
        current = current.parent
    return ""


def _candidate_links(tree: HTMLParser):  # noqa: ANN202
    """Yield (target, label) for every element that leads to a mandant.

    TEVIS landing pages use two shapes. Some render plain links; Düsseldorf
    and others render ``<button onclick="window.location.href='select2?md=2'"
    name="KFZ-Zulassungsbehörde">`` — the target lives in an onclick handler
    and the office name in the ``name`` attribute. Both are covered here.
    """
    for node in tree.css("a[href]"):
        yield node.attributes.get("href") or "", _label_for(node)
    for node in tree.css("[onclick]"):
        handler = node.attributes.get("onclick") or ""
        match = re.search(r"""['"]([^'"]*select2\?[^'"]*)['"]""", handler)
        if not match:
            continue
        label = (node.attributes.get("name") or node.attributes.get("title") or "").strip()
        yield match.group(1), label or _label_for(node)


def parse_landing(page: str, page_url: str, city: str, state: str) -> list[TevisOffice]:
    tree = HTMLParser(page)
    found: dict[tuple[str, str], TevisOffice] = {}
    for href, label in _candidate_links(tree):
        match = _MD_RE.search(href)
        if not match:
            continue
        absolute = urljoin(page_url, href)
        parsed = urlparse(absolute)
        mandant = (parse_qs(parsed.query).get("md") or [match.group(1)])[0]
        # Everything before /select2 is the instance base, prefix included.
        base_path = parsed.path[: parsed.path.lower().rfind("/select2")]
        base_url = f"{parsed.scheme}://{parsed.netloc}{base_path}"

        office_city = city
        prefix = base_path.strip("/").split("/")[0] if base_path.strip("/") else ""
        if prefix in EKOM21_LANDINGS:
            office_city = EKOM21_LANDINGS[prefix][0]

        key = (base_url, mandant)
        if key in found:
            continue
        found[key] = TevisOffice(
            city=office_city,
            state=state,
            host=parsed.netloc,
            base_url=base_url,
            mandant=mandant,
            name=label or f"Mandant {mandant}",
            booking_url=absolute,
        )
    return list(found.values())


async def discover_landing(client: httpx.AsyncClient, url: str, city: str, state: str) -> HostOutcome:
    """Read one landing page — a host root, or a prefixed path on a shared instance."""
    host = urlparse(url).netloc + urlparse(url).path.rstrip("/")
    # The calendar path is what the adapter will poll, so that is what robots
    # is asked about — a host may allow the landing page and forbid the rest.
    verdict = await robots.allowed(client, url + "suggest")
    if not verdict.allowed:
        return HostOutcome(host, city, f"robots.txt: {verdict.reason}", [])
    try:
        response = await client.get(url, timeout=15.0)
    except httpx.HTTPError as exc:
        return HostOutcome(host, city, f"error: {type(exc).__name__}", [])
    if response.status_code >= 400:
        return HostOutcome(host, city, f"HTTP {response.status_code} ohne Mandant — nicht aufzählbar", [])

    offices = parse_landing(response.text, str(response.url), city, state)
    status = (
        f"{len(offices)} Mandanten" if offices else "erreichbar, keine Mandanten-Links auf der Startseite"
    )
    return HostOutcome(host, city, status, offices)


def landing_of(url: str) -> str:
    """The instance's landing page for a URL somewhere inside it.

    ``…/stdar/select2?md=4`` and ``…/stdar/`` are the same instance; the
    landing page is everything up to the directory that holds ``select2``,
    with the trailing slash that keeps the prefix intact when paths are
    joined onto it later.
    """
    parsed = urlparse(url)
    path = parsed.path
    marker = path.lower().rfind("/select2")
    if marker >= 0:
        path = path[: marker + 1]
    elif not path.endswith("/"):
        path = path.rsplit("/", 1)[0] + "/" if "." in path.rsplit("/", 1)[-1] else path + "/"
    return f"{parsed.scheme}://{parsed.netloc}{path}"


def targets_from_sniff(paths: list[str]) -> dict[str, tuple[str, str]]:
    """TEVIS landings the portal survey found, one per instance."""
    targets: dict[str, tuple[str, str]] = {}
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                for link in row.get("links", []):
                    if link.get("vendor") != "tevis" or link.get("allowed") is False:
                        continue
                    targets.setdefault(landing_of(link["url"]), (row["city"], row.get("state", "")))
                    break
    return targets


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--survey", help="survey_cities.py JSON output")
    parser.add_argument("--sniff", action="append", help="sniff_portals.py JSONL output (repeatable)")
    parser.add_argument("--json", metavar="PATH")
    parser.add_argument("--concurrency", type=int, default=8)
    args = parser.parse_args()
    if not args.survey and not args.sniff:
        parser.error("give --survey, --sniff, or both")

    targets: dict[str, tuple[str, str]] = {}
    if args.survey:
        with open(args.survey, encoding="utf-8") as handle:
            survey = json.load(handle)
        for row in survey:
            best = row.get("best")
            confirmed = best and best["vendor"] == "tevis" and best["booking_allowed"]
            if confirmed and (best.get("status_code") or 200) < 400:
                # One fetch per host root; the shared ekom21 host is excluded
                # here because its root refuses, and is covered by prefix below.
                targets.setdefault(f"https://{best['host']}/", (row["city"], row["state"]))
    if args.sniff:
        for url, city_state in targets_from_sniff(args.sniff).items():
            targets.setdefault(url, city_state)
    for prefix, (city, state) in EKOM21_LANDINGS.items():
        targets[f"https://tevis.ekom21.de/{prefix}/"] = (city, state)

    # Concurrent across instances, never within one: the shared client already
    # spaces requests per host, so a hundred different cities can be read at
    # once without any single authority seeing more than one request at a time.
    semaphore = asyncio.Semaphore(args.concurrency)

    async def guarded(client: httpx.AsyncClient, url: str, city: str, state: str) -> HostOutcome:
        async with semaphore:
            try:
                outcome = await discover_landing(client, url, city, state)
            except Exception as exc:  # noqa: BLE001 - one bad instance must not stop the run
                outcome = HostOutcome(url, city, f"Fehler: {type(exc).__name__}", [])
            print(".", end="", file=sys.stderr, flush=True)
            return outcome

    async with build_client() as client:
        outcomes = list(
            await asyncio.gather(
                *(guarded(client, url, city, state) for url, (city, state) in targets.items())
            )
        )
    print(file=sys.stderr)

    total = 0
    for outcome in sorted(outcomes, key=lambda o: o.city):
        print(f"{outcome.city:24} {outcome.host[:40]:42} {outcome.status}")
        total += len(outcome.offices)
    print(f"\n{total} Ämter auf {len(outcomes)} Hosts")

    if args.json:
        payload = [{**asdict(o), "offices": [asdict(x) for x in o.offices]} for o in outcomes]
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
        print(f"wrote {args.json}")


if __name__ == "__main__":
    asyncio.run(main())
