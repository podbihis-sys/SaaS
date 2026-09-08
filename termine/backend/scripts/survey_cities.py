"""Survey the appointment systems of Germany's largest cities.

For each city this tries a handful of candidate booking hosts, fingerprints the
vendor from the page it gets back, and reads the host's **entire** robots.txt
to decide whether the booking flow may be polled. The output is the honest
answer to "where does this work": one row per city with vendor, adapter
support and the robots verdict.

    python -m scripts.survey_cities                # table
    python -m scripts.survey_cities --json out.json

Politeness: at most two requests per candidate host (root page and
robots.txt), a per-host delay, and bounded concurrency. Nothing here touches a
booking calendar; it only reads landing pages and robots.txt, which every host
publishes for exactly this purpose.

There is no registry of which city runs which system, so the candidate hosts
below are a mix of known instances and the naming patterns vendors use. A city
that resolves to none of them is reported as "kein Terminhost gefunden" — that
is a gap in this list, not proof the city has no booking system.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from dataclasses import asdict, dataclass
from urllib.parse import urlparse

import httpx

from app.providers.base import build_client
from app.providers.robots import RobotsRules

#: (city, state, population in thousands, explicit candidate hosts)
#: Explicit hosts are instances known or strongly suspected; the generic
#: patterns below are tried for every city as well.
CITIES: list[tuple[str, str, int, list[str]]] = [
    ("Berlin", "Berlin", 3_800, ["service.berlin.de"]),
    ("Hamburg", "Hamburg", 1_900, ["serviceportal.hamburg.de", "www.hamburg.de"]),
    ("München", "Bayern", 1_500, ["stadt.muenchen.de", "terminvereinbarung.muenchen.de"]),
    ("Köln", "Nordrhein-Westfalen", 1_090, ["termine.stadt-koeln.de"]),
    ("Frankfurt am Main", "Hessen", 770, ["tevis.ekom21.de", "frankfurt.de"]),
    ("Stuttgart", "Baden-Württemberg", 630, ["service.stuttgart.de", "www.stuttgart.de"]),
    ("Düsseldorf", "Nordrhein-Westfalen", 620, ["termine.duesseldorf.de", "www.duesseldorf.de"]),
    ("Leipzig", "Sachsen", 620, ["www.leipzig.de", "terminvergabe.leipzig.de"]),
    ("Dortmund", "Nordrhein-Westfalen", 590, ["termine.dortmund.de", "www.dortmund.de"]),
    ("Essen", "Nordrhein-Westfalen", 580, ["termine.essen.de", "www.essen.de"]),
    ("Bremen", "Bremen", 570, ["termin.bremen.de"]),
    ("Dresden", "Sachsen", 560, ["www.dresden.de", "termine.dresden.de"]),
    ("Hannover", "Niedersachsen", 540, ["www.hannover.de", "termine.hannover.de"]),
    ("Nürnberg", "Bayern", 520, ["www.nuernberg.de", "termine.nuernberg.de"]),
    ("Duisburg", "Nordrhein-Westfalen", 500, ["termine.duisburg.de", "www.duisburg.de"]),
    ("Bochum", "Nordrhein-Westfalen", 370, ["termine.bochum.de", "www.bochum.de"]),
    ("Wuppertal", "Nordrhein-Westfalen", 360, ["termine.wuppertal.de", "www.wuppertal.de"]),
    ("Bielefeld", "Nordrhein-Westfalen", 340, ["termine.bielefeld.de", "www.bielefeld.de"]),
    ("Bonn", "Nordrhein-Westfalen", 340, ["termine.bonn.de", "www.bonn.de"]),
    ("Münster", "Nordrhein-Westfalen", 320, ["termine.stadt-muenster.de", "www.stadt-muenster.de"]),
    ("Mannheim", "Baden-Württemberg", 320, ["www.mannheim.de", "termine.mannheim.de"]),
    ("Karlsruhe", "Baden-Württemberg", 310, ["www.karlsruhe.de", "termine.karlsruhe.de"]),
    ("Augsburg", "Bayern", 300, ["www.augsburg.de", "termine.augsburg.de"]),
    ("Wiesbaden", "Hessen", 280, ["tevis.ekom21.de", "www.wiesbaden.de"]),
    ("Mönchengladbach", "Nordrhein-Westfalen", 270, ["termine.moenchengladbach.de", "www.moenchengladbach.de"]),
    ("Gelsenkirchen", "Nordrhein-Westfalen", 260, ["termine.gelsenkirchen.de", "www.gelsenkirchen.de"]),
    ("Aachen", "Nordrhein-Westfalen", 250, ["termine.aachen.de", "www.aachen.de"]),
    ("Braunschweig", "Niedersachsen", 250, ["www.braunschweig.de", "termine.braunschweig.de"]),
    ("Chemnitz", "Sachsen", 250, ["www.chemnitz.de", "termine.chemnitz.de"]),
    ("Kiel", "Schleswig-Holstein", 250, ["termine.kiel.de", "www.kiel.de"]),
    ("Halle (Saale)", "Sachsen-Anhalt", 240, ["www.halle.de", "termine.halle.de"]),
    ("Magdeburg", "Sachsen-Anhalt", 240, ["www.magdeburg.de", "termine.magdeburg.de"]),
    ("Freiburg im Breisgau", "Baden-Württemberg", 230, ["www.freiburg.de", "termine.freiburg.de"]),
    ("Krefeld", "Nordrhein-Westfalen", 230, ["termine.krefeld.de", "www.krefeld.de"]),
    ("Mainz", "Rheinland-Pfalz", 220, ["www.mainz.de", "termine.mainz.de"]),
    ("Lübeck", "Schleswig-Holstein", 220, ["termine.luebeck.de", "www.luebeck.de"]),
    ("Erfurt", "Thüringen", 210, ["www.erfurt.de", "termine.erfurt.de"]),
    ("Oberhausen", "Nordrhein-Westfalen", 210, ["termine.oberhausen.de", "www.oberhausen.de"]),
    ("Rostock", "Mecklenburg-Vorpommern", 210, ["www.rostock.de", "termine.rostock.de"]),
    ("Kassel", "Hessen", 200, ["tevis.ekom21.de", "www.kassel.de"]),
    ("Hagen", "Nordrhein-Westfalen", 190, ["termine.hagen.de", "www.hagen.de"]),
    ("Potsdam", "Brandenburg", 190, ["www.potsdam.de", "termine.potsdam.de"]),
    ("Saarbrücken", "Saarland", 180, ["www.saarbruecken.de", "termine.saarbruecken.de"]),
    ("Hamm", "Nordrhein-Westfalen", 180, ["termine.hamm.de", "www.hamm.de"]),
    ("Ludwigshafen", "Rheinland-Pfalz", 170, ["www.ludwigshafen.de", "termine.ludwigshafen.de"]),
    ("Oldenburg", "Niedersachsen", 170, ["www.oldenburg.de", "termine.oldenburg.de"]),
    ("Osnabrück", "Niedersachsen", 170, ["www.osnabrueck.de", "termine.osnabrueck.de"]),
    ("Leverkusen", "Nordrhein-Westfalen", 160, ["termine.leverkusen.de", "www.leverkusen.de"]),
    ("Darmstadt", "Hessen", 160, ["tevis.ekom21.de", "www.darmstadt.de"]),
    ("Heidelberg", "Baden-Württemberg", 160, ["www.heidelberg.de", "termine.heidelberg.de"]),
]

#: Hostname patterns tried for every city, using an ASCII slug.
GENERIC_PATTERNS = [
    "termine.{slug}.de",
    "termin.{slug}.de",
    "tevis.{slug}.de",
    "{slug}.tevis-online.de",
    "terminvereinbarung.{slug}.de",
    "buergerservice.{slug}.de",
]

#: Vendor fingerprints, checked against the final URL and page body. Order
#: matters only for readability; a page matching several is reported as the
#: first hit, which is rare in practice.
VENDOR_SIGNATURES: list[tuple[str, str, bool]] = [
    # (vendor, regex, supported by an adapter)
    ("tevis", r"select2\?md=|/select2|tevis|cnc-\d+", True),
    ("berlin_zms", r"terminvereinbarung/termin", True),
    ("netappoint", r"netappoint", True),
    ("etermin", r"etermin\.net", True),
    ("cleverq", r"cleverq", False),
    ("terminland", r"terminland\.de", False),
    ("qmatic", r"qmatic", False),
    ("no-q", r"no-q\.info", False),
    ("timify", r"timify", False),
    ("smartcjm", r"smartcjm|smart-cjm", False),
    ("nolis", r"nolis", False),
]

#: Booking paths an adapter would request, per vendor — what robots.txt is
#: asked about. A blanket `Disallow: /` blocks all of them anyway.
VENDOR_BOOKING_PATHS = {
    "tevis": "/select2",
    "berlin_zms": "/terminvereinbarung/termin/day/",
    "netappoint": "/netappoint/index.php",
    "etermin": "/api/appointments/getfreeslots",
}

USER_AGENT_TOKEN = "TerminRadar"


def slugify(city: str) -> str:
    slug = city.lower()
    for src, dst in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        slug = slug.replace(src, dst)
    slug = re.split(r"[ (]", slug)[0]  # "halle (saale)" -> "halle"
    return re.sub(r"[^a-z0-9-]", "", slug)


@dataclass
class HostResult:
    host: str
    reachable: bool
    final_url: str | None = None
    vendor: str | None = None
    supported: bool = False
    robots_status: str = "not fetched"
    booking_allowed: bool | None = None
    error: str | None = None


@dataclass
class CityResult:
    city: str
    state: str
    population_k: int
    hosts: list[HostResult]

    @property
    def best(self) -> HostResult | None:
        """The most useful host: supported vendor first, then any vendor, then any reachable."""
        ranked = sorted(
            (h for h in self.hosts if h.reachable),
            key=lambda h: (h.supported, h.vendor is not None),
            reverse=True,
        )
        return ranked[0] if ranked else None


def fingerprint(url: str, body: str) -> tuple[str | None, bool]:
    haystack = (url + "\n" + body).lower()
    for vendor, pattern, supported in VENDOR_SIGNATURES:
        if re.search(pattern, haystack):
            return vendor, supported
    return None, False


async def probe_host(client: httpx.AsyncClient, host: str, sem: asyncio.Semaphore) -> HostResult:
    result = HostResult(host=host, reachable=False)
    async with sem:
        try:
            response = await client.get(f"https://{host}/", timeout=10.0)
        except httpx.HTTPError as exc:
            result.error = type(exc).__name__
            return result

        result.reachable = True
        result.final_url = str(response.url)
        result.vendor, result.supported = fingerprint(result.final_url, response.text[:200_000])

        await asyncio.sleep(1.0)
        try:
            robots_response = await client.get(f"https://{host}/robots.txt", timeout=10.0)
        except httpx.HTTPError as exc:
            result.robots_status = f"error: {type(exc).__name__}"
            return result

        if robots_response.status_code >= 400:
            result.robots_status = f"{robots_response.status_code} (keine Datei → erlaubt)"
            result.booking_allowed = True
            return result

        rules = RobotsRules(robots_response.text)
        path = VENDOR_BOOKING_PATHS.get(result.vendor or "", urlparse(result.final_url).path or "/")
        result.booking_allowed = rules.allowed(USER_AGENT_TOKEN, path)
        blanket = rules.allowed(USER_AGENT_TOKEN, "/") is False
        result.robots_status = "Disallow: /" if blanket else ("erlaubt" if result.booking_allowed else "Buchungspfad gesperrt")
        return result


async def survey(only: set[str] | None = None) -> list[CityResult]:
    sem = asyncio.Semaphore(6)
    results: list[CityResult] = []
    async with build_client() as client:
        for city, state, pop, explicit in CITIES:
            if only and city not in only:
                continue
            slug = slugify(city)
            candidates = list(dict.fromkeys(explicit + [p.format(slug=slug) for p in GENERIC_PATTERNS]))
            hosts = await asyncio.gather(*(probe_host(client, h, sem) for h in candidates))
            results.append(CityResult(city, state, pop, list(hosts)))
            print(".", end="", file=sys.stderr, flush=True)
    print(file=sys.stderr)
    return results


def render(results: list[CityResult]) -> str:
    lines = [f"{'Stadt':22} {'System':12} {'Adapter':8} {'robots.txt':26} {'Host'}", "-" * 100]
    for r in results:
        best = r.best
        if best is None:
            lines.append(f"{r.city:22} {'—':12} {'—':8} {'kein Terminhost gefunden':26}")
            continue
        vendor = best.vendor or "unbekannt"
        adapter = "ja" if best.supported else "nein"
        lines.append(f"{r.city:22} {vendor:12} {adapter:8} {best.robots_status:26} {best.host}")
    return "\n".join(lines)


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", metavar="PATH")
    parser.add_argument("--city", action="append", help="restrict to these cities (repeatable)")
    args = parser.parse_args()

    results = await survey(set(args.city) if args.city else None)
    print(render(results))

    if args.json:
        payload = [
            {**asdict(r), "best": asdict(r.best) if r.best else None} for r in results
        ]
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
        print(f"\nwrote {args.json}")


if __name__ == "__main__":
    asyncio.run(main())
