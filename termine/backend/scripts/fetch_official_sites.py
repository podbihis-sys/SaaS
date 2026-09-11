"""Fetch the official website of every German municipality, by Gemeindeschlüssel.

    python -m scripts.fetch_official_sites --out sites.json

Guessing hostnames finds the large cities and misses everyone else: in the
country-wide survey, 4 156 municipalities had no website at any of the usual
names. Almost all of them have one — it is just not called
``www.<name>.de``. Wikidata records it: property P439 is the amtlicher
Gemeindeschlüssel and P856 is the official website, so one query returns the
mapping for the whole country.

The query goes to QLever (``qlever.dev``), a public SPARQL endpoint over the
same Wikidata dump. Not to ``query.wikidata.org``: that host's robots.txt says
``Disallow: /sparql``, and this project does not make exceptions to robots.txt
for its own convenience — see docs/legal.md. QLever publishes no robots.txt,
which under RFC 9309 means no restriction, and one query is one request.

The result feeds ``scripts/sniff_portals.py --sites``, which then reads the
municipality's real homepage instead of guessing at it.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys

import httpx

from app.providers.base import build_client

ENDPOINT = "https://qlever.dev/api/wikidata"

QUERY = """
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT ?ags ?site WHERE {
  ?item wdt:P439 ?ags .
  ?item wdt:P856 ?site .
}
"""


def choose(sites: list[str]) -> str:
    """One website per municipality.

    A place can carry several: the administration's site and a tourism or
    marketing site ("hamburg.com" next to "hamburg.de"). The German-domain one
    wins, then the shortest — an authority's own site is rarely the long one.
    """
    ranked = sorted(sites, key=lambda url: (not url.rstrip("/").endswith(".de"), len(url)))
    return ranked[0]


async def fetch() -> dict[str, str]:
    async with build_client() as client:
        response = await client.get(
            ENDPOINT,
            params={"query": QUERY},
            headers={"Accept": "application/sparql-results+json"},
            timeout=httpx.Timeout(120.0, connect=15.0),
        )
        response.raise_for_status()
        payload = response.json()

    grouped: dict[str, list[str]] = {}
    for row in payload["results"]["bindings"]:
        ags = row["ags"]["value"].strip()
        site = row["site"]["value"].strip()
        if len(ags) == 8 and ags.isdigit() and site.startswith("http"):
            grouped.setdefault(ags, []).append(site)
    return {ags: choose(sites) for ags, sites in grouped.items()}


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    sites = await fetch()
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(sites, handle, ensure_ascii=False, indent=0, sort_keys=True)
    print(f"{len(sites)} Gemeinde-Websites -> {args.out}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
