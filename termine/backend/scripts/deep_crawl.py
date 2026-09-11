"""Follow a city's own website until the appointment system turns up.

    python -m scripts.deep_crawl --cities-file gross.json --sites sites.json \
        --jsonl gross.jsonl --max-pages 40

``scripts/sniff_portals.py`` reads the homepage and at most three pages behind
it. That is the right budget for 10 000 municipalities and too small for a
large city: Cologne, Hamburg and Munich put their booking system four or five
clicks down, under "Rathaus" → "Bürgerservice" → "Dienstleistungen A–Z" →
a service page → "Termin vereinbaren".

So this crawls, rather than sniffs: a breadth-first walk of the city's own
site, ordered by how much a link's text and URL sound like an appointment,
stopping the moment a booking system is found. Every page is checked against
the site's robots.txt first — crawling deeper is exactly when that stops being
a formality. Output is the same JSON Lines shape ``sniff_portals`` writes, so
the catalogue builders read it unchanged.

The budget is per city: at most ``--max-pages`` pages, at most ``--max-depth``
levels, one request per second to any one host. Thirty big cities cost about
as much as a thousand villages did.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from dataclasses import asdict
from urllib.parse import urljoin, urlparse

import httpx
from selectolax.parser import HTMLParser

from app.providers.base import build_client
from app.providers.robots import robots
from scripts.sniff_portals import (
    _NOISE,
    Link,
    Outcome,
    _page_links,
    extract_links,
)
from scripts.survey_cities import VENDOR_BOOKING_PATHS, fingerprint, slug_variants

#: How promising a link is. The crawl spends its budget from the top down, so
#: what sits here decides whether a city is found in five pages or forty.
_RANKS: list[tuple[int, re.Pattern[str]]] = [
    (6, re.compile(r"termin\s*(vereinbaren|buchen|reservieren)|terminvereinbarung|onlinetermin", re.I)),
    (5, re.compile(r"\btermin", re.I)),
    (4, re.compile(r"b(ue|ü)rger(service|amt|b(ue|ü)ro|center)|einwohnermelde|meldeamt", re.I)),
    (3, re.compile(r"dienstleistung|online-?dienste|serviceportal|b(ue|ü)rgerdienste|a-z|a–z", re.I)),
    (2, re.compile(r"rathaus|stadtverwaltung|verwaltung|service", re.I)),
    (1, re.compile(r"kfz|zulassung|f(ue|ü)hrerschein|ausl(ae|ä)nder|standesamt|gewerbe|pass|ausweis", re.I)),
]

#: Paths worth trying directly on a city's host before crawling for them.
_DIRECT_PATHS = (
    "/terminvereinbarung",
    "/termine",
    "/termin",
    "/buergerservice",
    "/rathaus/buergerservice",
    "/online-dienste",
)

#: Subdomains large cities park their service portal on.
_SERVICE_HOSTS = (
    "service.{slug}.de",
    "serviceportal.{slug}.de",
    "buergerservice.{slug}.de",
    "termine.{slug}.de",
    "termin.{slug}.de",
    "terminvereinbarung.{slug}.de",
    "dienstleistungen.{slug}.de",
    "otv.{slug}.de",
)

#: The vendors' own hosts, addressed by city slug. Every one of these is a
#: documented shape the vendor uses for all its customers, so asking for one
#: city is a single request to a system built to answer it — cheaper and more
#: certain than crawling a site that hides the link behind a JavaScript menu.
#: Tried after the city's own pages, so a city that links its system plainly
#: is never probed for at all.
_VENDOR_SEEDS = (
    "https://{slug}.saas.smartcjm.com/",
    "https://{slug}.termine-reservieren.online/",
    "https://termine-reservieren.de/termine/{slug}/",
    "https://tevis.itebo.de/{slug}/",
    "https://{slug}.tevis-online.de/",
)


def rank(text: str, url: str) -> int:
    for score, pattern in _RANKS:
        if pattern.search(text) or pattern.search(url):
            return score
    return 0


def registrable(host: str) -> str:
    """The last two labels of a hostname — good enough to tell one city's estate apart."""
    parts = host.lower().removeprefix("www.").split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host.lower()


def seeds(entry: dict) -> list[tuple[str, bool]]:
    """Where to start, each with whether the host is known or merely guessed.

    The official site comes from the register and exists; ``termin.<stadt>.de``
    and its dozen siblings are guesses, most of which are nothing. The flag
    rides along because the two deserve very different patience — see
    ``CityCrawler.fetch``.
    """
    urls: list[tuple[str, bool]] = []
    seen: set[str] = set()

    def add(url: str, guessed: bool) -> None:
        if url not in seen:
            seen.add(url)
            urls.append((url, guessed))

    site = entry.get("site")
    if site:
        add(site, False)
        root = f"{urlparse(site).scheme}://{urlparse(site).netloc}"
        for path in _DIRECT_PATHS:
            add(root + path, False)

    stems = list(slug_variants(entry["city"]))[:2]
    for stem in stems:
        if not site:
            add(f"https://www.{stem}.de/", True)
        for pattern in _SERVICE_HOSTS:
            add(f"https://{pattern.format(slug=stem)}/", True)
    return urls


def vendor_seeds(entry: dict) -> list[str]:
    stems = list(slug_variants(entry["city"]))[:2]
    return [pattern.format(slug=stem) for stem in stems for pattern in _VENDOR_SEEDS]


class CityCrawler:
    """One city's walk, with its own budget and its own visited set."""

    def __init__(self, client: httpx.AsyncClient, entry: dict, max_pages: int, max_depth: int) -> None:
        self.client = client
        self.entry = entry
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.seen_urls: set[str] = set()
        self.pages = 0
        self.outcome = Outcome(
            city=entry["city"],
            state=entry.get("state", ""),
            ags=entry.get("ags", ""),
            population=entry.get("population", 0),
        )
        self.allowed_domains: set[str] = set()

    async def fetch(self, url: str, guessed: bool = False) -> httpx.Response | None:
        if url in self.seen_urls or self.pages >= self.max_pages:
            return None
        self.seen_urls.add(url)

        # Most of what this crawler asks for does not exist: `termin.<stadt>.de`
        # and a dozen shapes like it, tried because one of them usually is the
        # booking host. A guess that resolves to a firewall drops the
        # connection silently, so it costs a full timeout — twice over, with
        # the retry — and one district's guesses can take minutes. Waiting is
        # worth it for a page we found a link to, or for the official site;
        # for a name we invented it is not, and being wrong costs nothing.
        try:
            verdict = await robots.allowed(self.client, url, patient=not guessed)
        except httpx.HTTPError:
            return None
        if not verdict.allowed:
            return None

        self.pages += 1
        timeout = httpx.Timeout(15.0, connect=6.0) if not guessed else httpx.Timeout(4.0, connect=2.5)
        try:
            response = await self.client.get(url, timeout=timeout, follow_redirects=True)
        except httpx.HTTPError:
            return None
        if response.status_code >= 400 or not response.text:
            if self.outcome.homepage_status is None:
                self.outcome.homepage_status = response.status_code
            return None
        if self.outcome.homepage is None:
            self.outcome.homepage = str(response.url)
            self.outcome.homepage_status = response.status_code
        return response

    def collect(self, response: httpx.Response) -> bool:
        """Take the booking links off a page. True when something was found.

        A vendor seed answers about itself: if the page we asked for *is* a
        booking system, the page's own URL is the find, not something linked
        from it.
        """
        page_url = str(response.url)
        vendor, supported = fingerprint(page_url, response.text[:200_000])
        if vendor and all(page_url != known.url for known in self.outcome.links):
            self.outcome.links.append(Link(url=page_url, vendor=vendor, supported=supported))

        for link in extract_links(response.text, page_url):
            if all(link.url != known.url for known in self.outcome.links):
                self.outcome.links.append(link)
        return any(link.vendor for link in self.outcome.links)

    def candidates(self, response: httpx.Response, depth: int) -> list[tuple[int, str, int, bool]]:
        """Same-estate links worth following, best first."""
        page_url = str(response.url)
        page_domain = registrable(urlparse(page_url).netloc)
        self.allowed_domains.add(page_domain)

        scored: dict[str, int] = {}
        for href, text in _page_links(HTMLParser(response.text)):
            if not href or _NOISE.search(href):
                continue
            absolute = urljoin(page_url, href.strip()).split("#")[0]
            if not absolute.startswith("http") or absolute in self.seen_urls:
                continue
            host = urlparse(absolute).netloc
            if registrable(host) not in self.allowed_domains:
                continue
            score = rank(text, absolute)
            if score and score > scored.get(absolute, 0):
                scored[absolute] = score
        # A link we found on a real page is not a guess, whatever its host.
        return [(score, url, depth + 1, False) for url, score in scored.items()]

    async def run(self) -> Outcome:
        # (score, url, depth, guessed)
        queue: list[tuple[int, str, int, bool]] = [(9, url, 0, guessed) for url, guessed in seeds(self.entry)]
        # Score 7 keeps these ahead of anything the crawl discovers (max 6) but
        # behind the city's own entry points.
        queue += [(7, url, self.max_depth, True) for url in vendor_seeds(self.entry)]

        while queue and self.pages < self.max_pages:
            queue.sort(key=lambda item: (-item[0], item[2]))
            score, url, depth, guessed = queue.pop(0)
            self.outcome.tried.append(url)
            response = await self.fetch(url, guessed)
            if response is None:
                continue
            if self.collect(response):
                break
            if depth < self.max_depth:
                queue.extend(self.candidates(response, depth))

        await self.finish()
        return self.outcome

    async def finish(self) -> None:
        if not self.outcome.links:
            if self.outcome.homepage is None:
                self.outcome.status = (
                    "Website blockiert (HTTP 403)"
                    if self.outcome.homepage_status == 403
                    else "Website nicht gefunden"
                )
            else:
                self.outcome.status = "kein Terminsystem verlinkt"
            return

        # An unfamiliar booking host names its vendor on its own page.
        for link in [x for x in self.outcome.links if x.vendor is None][:2]:
            try:
                response = await self.client.get(link.url, timeout=httpx.Timeout(15.0, connect=6.0))
            except httpx.HTTPError:
                continue
            if response.status_code < 400 and response.text:
                link.vendor, link.supported = fingerprint(str(response.url), response.text[:200_000])

        self.outcome.links.sort(key=lambda link: (link.supported, link.vendor is not None), reverse=True)
        del self.outcome.links[8:]

        for link in [x for x in self.outcome.links if x.vendor][:3]:
            parsed = urlparse(link.url)
            path = VENDOR_BOOKING_PATHS.get(link.vendor or "", parsed.path or "/")
            try:
                verdict = await robots.allowed(self.client, f"{parsed.scheme}://{parsed.netloc}{path}")
            except httpx.HTTPError as exc:
                link.robots = f"error: {type(exc).__name__}"
                continue
            link.allowed = verdict.allowed
            link.robots = verdict.reason

        best = self.outcome.best
        self.outcome.status = (best.vendor or "unbekannt") if best else "kein Terminsystem verlinkt"


async def crawl(
    client: httpx.AsyncClient, entry: dict, sem: asyncio.Semaphore, max_pages: int, max_depth: int
) -> Outcome:
    async with sem:
        crawler = CityCrawler(client, entry, max_pages, max_depth)
        try:
            return await crawler.run()
        except Exception as exc:  # noqa: BLE001 - one city must not end the run
            crawler.outcome.status = f"Fehler: {type(exc).__name__}"
            return crawler.outcome


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cities-file", required=True)
    parser.add_argument("--sites", help="official websites by Gemeindeschlüssel")
    parser.add_argument("--jsonl", required=True)
    parser.add_argument("--skip-jsonl", action="append", help="results whose cities are skipped")
    parser.add_argument(
        "--only-missing", metavar="PATH", help="crawl only what this run left without a vendor"
    )
    parser.add_argument("--max-pages", type=int, default=40)
    parser.add_argument("--max-depth", type=int, default=4)
    parser.add_argument("--concurrency", type=int, default=8)
    args = parser.parse_args()

    with open(args.cities_file, encoding="utf-8") as handle:
        entries = json.load(handle)

    if args.sites:
        with open(args.sites, encoding="utf-8") as handle:
            sites = json.load(handle)
        for entry in entries:
            if site := sites.get(entry.get("ags")):
                entry["site"] = site

    if args.only_missing:
        have: set[str] = set()
        with open(args.only_missing, encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                if any(link.get("vendor") for link in row.get("links", [])):
                    have.add(row["ags"])
        entries = [e for e in entries if e["ags"] not in have]

    done: set[str] = set()
    for path in (args.skip_jsonl or []) + [args.jsonl]:
        try:
            with open(path, encoding="utf-8") as handle:
                done.update(json.loads(line)["ags"] for line in handle if line.strip())
        except FileNotFoundError:
            continue
    entries = [e for e in entries if e.get("ags") not in done]
    print(f"{len(entries)} Städte zu durchsuchen", file=sys.stderr)

    sem = asyncio.Semaphore(args.concurrency)
    counts: dict[str, int] = {}
    with open(args.jsonl, "a", encoding="utf-8") as out:
        async with build_client() as client:
            tasks = [crawl(client, entry, sem, args.max_pages, args.max_depth) for entry in entries]
            for index, task in enumerate(asyncio.as_completed(tasks), start=1):
                outcome = await task
                out.write(json.dumps(asdict(outcome), ensure_ascii=False) + "\n")
                out.flush()
                counts[outcome.status] = counts.get(outcome.status, 0) + 1
                best = outcome.best
                print(
                    f"  [{index}/{len(entries)}] {outcome.city:24} {outcome.status:28} "
                    f"{(best.url[:60] if best else '')}",
                    file=sys.stderr,
                    flush=True,
                )

    print("\nErgebnis:", file=sys.stderr)
    for status, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {count:4}  {status}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
