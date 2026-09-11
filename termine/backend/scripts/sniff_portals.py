"""Find a municipality's appointment system by reading its own website.

    python -m scripts.register_cities --min-population 20000 --out big.json
    python -m scripts.sniff_portals --cities-file big.json --jsonl big.jsonl

Guessing subdomains (``termine.<slug>.de``) works for large cities and fails
for everyone else: a town of 8 000 does not run its own host, it links to a
vendor — netAppoint, TEVIS, eTermin, Terminland, cleverQ — from its homepage.
So this asks the municipality itself: fetch the homepage, take the links that
point at a booking system, and check the target's robots.txt.

That is one request per municipality plus one robots.txt per system found,
which is what makes surveying all 10 943 of them defensible. Nothing here
opens a calendar; the booking URL is recorded, not called.

A municipality whose homepage cannot be found under any of the usual names is
reported as "Website nicht gefunden" — a gap in the guesses, not proof that it
has no booking system. Same for a homepage that renders its menu with
JavaScript: the link is there, we just cannot see it without executing the
page, and executing pages is not what a polite crawler does.

Results are written as JSON Lines while the run proceeds, and ``--skip-jsonl``
skips what an earlier run already covered, so a survey of the whole country
survives being interrupted.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from urllib.parse import urljoin, urlparse

import httpx
from selectolax.parser import HTMLParser

from app.providers.base import build_client
from app.providers.robots import robots
from scripts.survey_cities import (
    VENDOR_BOOKING_PATHS,
    VENDOR_SIGNATURES,
    fingerprint,
    slug_variants,
)

#: Generic words that are not a hostname stem on their own: "Kreis" alone
#: would send every district to termine.kreis.de.
_GENERIC = {"kreis", "landkreis", "stadt", "gemeinde", "markt", "samtgemeinde", "verbandsgemeinde", "amt"}

#: Words a URL carries when it leads to an appointment system. Used only to
#: rank same-site links; a vendor match always wins.
_BOOKING_WORDS = re.compile(r"termin|buchung|appointment|booking|buergerservice|onlinetermin", re.I)

#: Anything that is plainly not a booking system, however much it says "Termin".
#: The council information system is the classic false positive: every German
#: municipality has one, it lives at ris./sitzungsdienst./ratsinfo. and its
#: "Termine" are committee meetings, not appointments.
_NOISE = re.compile(
    r"\.(pdf|jpe?g|png|gif|svg|ico|css|js|zip|docx?|xlsx?)(\?|$)|"
    r"facebook\.com|twitter\.com|x\.com|instagram\.com|youtube\.com|linkedin\.com|"
    r"google\.|maps\.|wikipedia\.org|javascript:|mailto:|tel:|"
    r"ris\.|ratsinfo|sitzungsdienst|allris|sessionnet|veranstaltung|kalender\.",
    re.I,
)

#: Link texts and paths that lead to the page where the booking link actually
#: sits, when the homepage itself does not carry it.
#: Ranked: a link that says "Termin" beats one that says "Bürgerservice",
#: which beats the general "Rathaus" page. Without the ranking the two follow-up
#: fetches get spent on whatever the navigation lists first.
_SECOND_LEVEL_RANKS: list[tuple[int, re.Pattern[str]]] = [
    (3, re.compile(r"terminvereinbarung|online-?termin|termin\s*(vereinbaren|buchen)|/termin", re.I)),
    (2, re.compile(r"b(ue|ü)rger(service|amt|b(ue|ü)ro)|einwohnermelde|serviceportal", re.I)),
    (1, re.compile(r"online-?dienste|dienstleistung|b(ue|ü)rger|rathaus|stadtverwaltung|verwaltung", re.I)),
]


def _second_level_rank(text: str, url: str) -> int:
    for rank, pattern in _SECOND_LEVEL_RANKS:
        if pattern.search(text) or pattern.search(url):
            return rank
    return 0


@dataclass
class Link:
    url: str
    vendor: str | None
    supported: bool
    #: Only filled for the links that were actually checked.
    robots: str | None = None
    allowed: bool | None = None


@dataclass
class Outcome:
    city: str
    state: str
    ags: str
    population: int
    homepage: str | None = None
    homepage_status: int | None = None
    tried: list[str] = field(default_factory=list)
    status: str = ""
    links: list[Link] = field(default_factory=list)

    @property
    def best(self) -> Link | None:
        ranked = sorted(
            self.links,
            key=lambda link: (link.supported, link.vendor is not None, link.allowed is True),
            reverse=True,
        )
        return ranked[0] if ranked else None


def homepage_candidates(entry: dict) -> list[str]:
    """Where a municipality's own website is, best first.

    An entry that carries a ``site`` — the official website from the register
    of municipal websites, keyed by Gemeindeschlüssel — needs no guessing at
    all, and the guesses stay behind it as a fallback. Guessing alone left
    4 156 municipalities "not found" in the country-wide run; almost all of
    them have a website, just not under a name any pattern predicts.
    """
    hosts: list[str] = []
    if site := entry.get("site"):
        hosts.append(site)
    hosts.extend(entry.get("hosts") or [])
    kind = entry.get("kind", "")

    def add(host: str) -> None:
        if host not in hosts:
            hosts.append(host)

    stems = [s for s in slug_variants(entry["city"]) if s not in _GENERIC]
    if kind in ("43", "44", "45"):  # a Kreis: its name is not its domain
        # Districts name their sites every way there is: kreis-ploen.de,
        # landkreis-goslar.de, ammerland.de, lra-kronach.de (Bavaria calls the
        # authority Landratsamt), lk-ni.de. The register gives only the plain
        # name, so all of the common shapes get a turn.
        bare = re.sub(r"^(land)?kreis\s+|\s*\(?kreis\)?$", "", entry["city"], flags=re.I)
        # The register abbreviates where the domain spells out or drops:
        # "Pfaffenhofen a.d.Ilm" is landkreis-pfaffenhofen.de, "Neumarkt
        # i.d.OPf." is landkreis-neumarkt.de. slug_variants' last variant is
        # the bare first word, which is exactly that.
        bare = re.sub(r"\s*[ai]\.\s*[dm]?\.?\s*\S*$", "", bare)
        bare_stems = [s for s in slug_variants(bare) if s not in _GENERIC]
        for stem in bare_stems[:3]:
            add(f"www.kreis-{stem}.de")
            add(f"www.landkreis-{stem}.de")
        for stem in bare_stems[:1]:
            add(f"www.{stem}.de")
            add(f"www.lra-{stem}.de")
            add(f"www.landratsamt-{stem}.de")
            add(f"www.kreis{stem}.de")
        for stem in stems[:1]:
            add(f"www.{stem}.de")
        return hosts[:9]

    for stem in stems[:3]:
        # Three stems, because a city's domain drops what its official name
        # keeps: "Frankfurt am Main" is frankfurt.de, "Freiburg im Breisgau"
        # is freiburg.de — the bare first word, which is the third variant.
        add(f"www.{stem}.de")
    prefix = "stadt" if kind in ("61", "62", "63", "67") else "gemeinde"
    if stems:
        add(f"www.{prefix}-{stems[0]}.de")
    # A member of a Verbandsgemeinde, Samtgemeinde or Amt is administered
    # there, so that is where its booking system is.
    if entry.get("verband"):
        for stem in [s for s in slug_variants(entry["verband"]) if s not in _GENERIC][:1]:
            add(f"www.{stem}.de")
    return hosts[:5]


def classify(url: str) -> tuple[str | None, bool]:
    lowered = url.lower()
    for vendor, pattern, supported in VENDOR_SIGNATURES:
        if re.search(pattern, lowered):
            return vendor, supported
    return None, False


def _page_links(tree: HTMLParser) -> list[tuple[str, str]]:
    """(url, link text) for everything on the page that can carry a target."""
    raw: list[tuple[str, str]] = []
    for node in tree.css("a[href]"):
        raw.append((node.attributes.get("href") or "", (node.text() or "").strip()[:120]))
    for node in tree.css("iframe[src], frame[src]"):
        raw.append((node.attributes.get("src") or "", ""))
    for node in tree.css("[onclick]"):
        handler = node.attributes.get("onclick") or ""
        label = (node.attributes.get("name") or node.attributes.get("title") or "").strip()
        raw.extend((url, label) for url in re.findall(r"""['"](https?://[^'"]+)['"]""", handler))
    return raw


def second_level_targets(html: str, page_url: str, limit: int = 2) -> list[str]:
    """Same-site pages that plausibly carry the booking link.

    Large cities do not put their appointment system on the front page; it sits
    one click away under "Bürgerservice" or "Terminvereinbarung". Following two
    such links turns most of those from "nothing found" into a real answer.
    """
    page_host = urlparse(page_url).netloc.lower()
    scored: dict[str, int] = {}
    for href, text in _page_links(HTMLParser(html)):
        if not href or _NOISE.search(href):
            continue
        absolute = urljoin(page_url, href.strip()).split("#")[0]
        if not absolute.startswith("http"):
            continue
        if urlparse(absolute).netloc.lower() != page_host or absolute.rstrip("/") == page_url.rstrip("/"):
            continue
        rank = _second_level_rank(text, absolute)
        if rank and rank > scored.get(absolute, 0):
            scored[absolute] = rank
    return [url for url, _ in sorted(scored.items(), key=lambda kv: -kv[1])][:limit]


#: Any absolute URL in the source, wherever it sits.
_URL_RE = re.compile(r"""https?://[^\s"'<>\\)]{8,200}""")


def extract_links(html: str, page_url: str) -> list[Link]:
    """Links on the page that lead to an appointment system.

    Two sweeps. The DOM gives anchors, frames and onclick handlers; a plain
    regex over the source then catches what a modern municipal site keeps out
    of the DOM — a booking URL inside a JSON menu blob, a script config, a
    data attribute. The second sweep only accepts URLs that match a vendor,
    because unlike an anchor it has no surrounding text to judge by.
    """
    seen: dict[str, Link] = {}
    raw = [url for url, _ in _page_links(HTMLParser(html))]
    raw.extend(url for url in _URL_RE.findall(html) if classify(url)[0])

    page_host = urlparse(page_url).netloc.lower()
    for href in raw:
        if not href or _NOISE.search(href):
            continue
        absolute = urljoin(page_url, href.strip())
        if not absolute.startswith("http"):
            continue
        vendor, supported = classify(absolute)
        host = urlparse(absolute).netloc.lower()
        if vendor is None:
            # Keep a same-organisation link only when its host is a separate
            # booking host; a /termine page of the CMS is an article.
            if host == page_host or not _BOOKING_WORDS.search(absolute):
                continue
            if host.split(".")[-2:] != page_host.split(".")[-2:] and not _BOOKING_WORDS.search(host):
                continue
        key = absolute.split("#")[0]
        seen.setdefault(key, Link(url=key, vendor=vendor, supported=supported))
    ranked = sorted(seen.values(), key=lambda link: (link.supported, link.vendor is not None), reverse=True)
    return ranked[:6]


async def fetch_homepage(client: httpx.AsyncClient, entry: dict, outcome: Outcome) -> str | None:
    for host in homepage_candidates(entry):
        outcome.tried.append(host)
        url = host if host.startswith("http") else f"https://{host}/"
        try:
            # Most candidates do not exist, and a hostname that does not
            # resolve is the common case rather than the exception: five
            # candidates × a long connect timeout is what decides how long a
            # survey of ten thousand municipalities takes.
            response = await client.get(url, timeout=httpx.Timeout(12.0, connect=4.0), follow_redirects=True)
        except httpx.HTTPError:
            continue
        if response.status_code < 400 and response.text:
            outcome.homepage = str(response.url)
            outcome.homepage_status = response.status_code
            return response.text
        outcome.homepage_status = response.status_code
    return None


async def sniff(client: httpx.AsyncClient, entry: dict, sem: asyncio.Semaphore) -> Outcome:
    """One municipality, never raising.

    A survey of ten thousand websites meets everything: a malformed header, a
    redirect loop, a page that decompresses to nothing. Letting one of them
    raise would abort the whole run — which is exactly what happened before
    this guard existed — so a failure is a result like any other and the run
    goes on.
    """
    outcome = Outcome(
        city=entry["city"],
        state=entry.get("state", ""),
        ags=entry.get("ags", ""),
        population=entry.get("population", 0),
    )
    try:
        return await _sniff(client, entry, outcome, sem)
    except Exception as exc:  # noqa: BLE001 - the point is to survive anything
        outcome.status = f"Fehler: {type(exc).__name__}"
        return outcome


async def _sniff(client: httpx.AsyncClient, entry: dict, outcome: Outcome, sem: asyncio.Semaphore) -> Outcome:
    async with sem:
        html = await fetch_homepage(client, entry, outcome)
        if html is None:
            # A 403 is a different fact from "no such host": the site exists
            # and refuses us. We do not disguise the client to get around it.
            outcome.status = (
                "Website blockiert (HTTP 403)" if outcome.homepage_status == 403 else "Website nicht gefunden"
            )
            return outcome

        page_url = outcome.homepage or ""
        outcome.links = extract_links(html, page_url)
        if not any(link.vendor for link in outcome.links):
            for target in second_level_targets(html, page_url, limit=3):
                outcome.tried.append(target)
                try:
                    response = await client.get(target, timeout=httpx.Timeout(12.0, connect=6.0))
                except httpx.HTTPError:
                    continue
                if response.status_code >= 400 or not response.text:
                    continue
                for link in extract_links(response.text, str(response.url)):
                    if all(link.url != known.url for known in outcome.links):
                        outcome.links.append(link)
                if any(link.vendor for link in outcome.links):
                    break

        # A booking host we cannot place from its URL is worth one page: the
        # hosted TEVIS instances announce themselves only in the body, and
        # "terminvergabe.hagen.de" says nothing until you look.
        for link in [x for x in outcome.links if x.vendor is None][:1]:
            try:
                response = await client.get(link.url, timeout=httpx.Timeout(12.0, connect=6.0))
            except httpx.HTTPError:
                continue
            if response.status_code < 400 and response.text:
                link.vendor, link.supported = fingerprint(str(response.url), response.text[:200_000])

        outcome.links.sort(key=lambda link: (link.supported, link.vendor is not None), reverse=True)
        del outcome.links[6:]

        # Only the links an adapter could serve are worth a robots request.
        for link in [x for x in outcome.links if x.vendor][:3]:
            path = VENDOR_BOOKING_PATHS.get(link.vendor or "", urlparse(link.url).path or "/")
            target = f"{urlparse(link.url).scheme}://{urlparse(link.url).netloc}{path}"
            try:
                verdict = await robots.allowed(client, target)
            except httpx.HTTPError as exc:
                link.robots = f"error: {type(exc).__name__}"
                continue
            link.allowed = verdict.allowed
            link.robots = verdict.reason
        best = outcome.best
        outcome.status = (best.vendor or "unbekannt") if best else "kein Terminsystem verlinkt"
        await asyncio.sleep(0.5)
    return outcome


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cities-file", required=True, help="output of scripts/register_cities.py")
    parser.add_argument("--jsonl", required=True, help="results, appended as they arrive")
    parser.add_argument(
        "--skip-jsonl", action="append", help="earlier results whose municipalities are skipped"
    )
    parser.add_argument(
        "--sites", help="official websites by Gemeindeschlüssel (scripts/fetch_official_sites.py)"
    )
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    with open(args.cities_file, encoding="utf-8") as handle:
        entries = json.load(handle)

    if args.sites:
        with open(args.sites, encoding="utf-8") as handle:
            sites = json.load(handle)
        for entry in entries:
            if site := sites.get(entry.get("ags")):
                entry["site"] = site

    done: set[str] = set()
    for path in (args.skip_jsonl or []) + [args.jsonl]:
        try:
            with open(path, encoding="utf-8") as handle:
                done.update(json.loads(line)["ags"] for line in handle if line.strip())
        except FileNotFoundError:
            continue
    entries = [e for e in entries if e.get("ags") not in done]
    if args.limit:
        entries = entries[: args.limit]
    print(f"{len(entries)} zu prüfen ({len(done)} bereits erledigt)", file=sys.stderr)

    sem = asyncio.Semaphore(args.concurrency)
    counts: dict[str, int] = {}
    written = 0
    # In batches rather than ten thousand tasks at once: results reach the
    # file in bounded chunks, and a run that is interrupted resumes from what
    # it wrote instead of losing everything in flight.
    batch_size = max(args.concurrency * 10, 100)
    with open(args.jsonl, "a", encoding="utf-8") as out:
        async with build_client() as client:
            for start in range(0, len(entries), batch_size):
                batch = entries[start : start + batch_size]
                outcomes = await asyncio.gather(
                    *(sniff(client, entry, sem) for entry in batch), return_exceptions=True
                )
                for entry, outcome in zip(batch, outcomes, strict=True):
                    if isinstance(outcome, BaseException):
                        outcome = Outcome(
                            city=entry["city"],
                            state=entry.get("state", ""),
                            ags=entry.get("ags", ""),
                            population=entry.get("population", 0),
                            status=f"Fehler: {type(outcome).__name__}",
                        )
                    out.write(json.dumps(asdict(outcome), ensure_ascii=False) + "\n")
                    counts[outcome.status] = counts.get(outcome.status, 0) + 1
                    written += 1
                out.flush()
                print(f"  {written}/{len(entries)}", file=sys.stderr, flush=True)

    print("\nErgebnis:", file=sys.stderr)
    for status, count in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {count:5}  {status}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
