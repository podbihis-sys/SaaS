"""Turn a Wikipedia "Liste der Gemeinden in <Land>" page into a cities file.

    python -m scripts.fetch_gemeinden \\
        --url https://de.wikipedia.org/wiki/Liste_der_Gemeinden_in_Nordrhein-Westfalen \\
        --state Nordrhein-Westfalen --out nrw.json

The output feeds ``scripts/survey_cities.py --cities-file``. Wikipedia is the
right source here: it is the one place that lists every municipality of a
state with a current population figure, it is maintained, and its robots.txt
permits reading article pages.

Two shapes are read. Municipalities appear as list items ``Name (12.345)``
under the per-category sections; the kreisfreie Städte additionally sit in a
wikitable whose first column is the city. Both are merged and de-duplicated by
name. Anything else on the page — navigation, footnotes, lead paragraphs — is
ignored because it does not match either shape.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys

from selectolax.parser import HTMLParser

from app.providers.base import build_client
from app.providers.robots import robots

#: The population is the *last* parenthesised group: names carry their own
#: parentheses ("Gronau (Westf.)", "Hennef (Sieg)"), and those stay part of the
#: name because they are how the place is told apart from its namesakes.
_ENTRY_RE = re.compile(r"^(?P<name>.+?)\s*\((?P<pop>\d{1,3}(?:\.\d{3})*)\)\s*$")


def parse_page(html: str, state: str) -> list[dict]:
    tree = HTMLParser(html)
    content = tree.css_first("#mw-content-text") or tree
    # Footnote markers render as <sup> and drag an inline <style> block into
    # the cell text on some rows ("Aachen" came out with 600 characters of CSS
    # attached). Neither is part of a name, so both go before any text is read.
    for node in content.css("sup, style, .fussnoten-marke, .fussnoten-inhalt"):
        node.decompose()
    found: dict[str, dict] = {}

    for li in content.css("li"):
        match = _ENTRY_RE.match(li.text().strip())
        if not match:
            continue
        name = match.group("name").strip()
        population = int(match.group("pop").replace(".", ""))
        found.setdefault(name, {"city": name, "state": state, "population_k": round(population / 1000)})

    # Kreisfreie Städte: a wikitable with the city in column one and a
    # population somewhere in the row. Leading zeros are sort keys, not digits
    # of the number.
    for table in content.css("table.wikitable"):
        for row in table.css("tr")[1:]:
            cells = [c.text().strip() for c in row.css("th, td")]
            if len(cells) < 2:
                continue
            name = re.split(r",|\(", cells[0])[0].strip()
            numbers = [c for c in cells[1:] if re.fullmatch(r"0?\.?\d{1,3}(?:\.\d{3})+", c)]
            if not name or not numbers:
                continue
            population = int(numbers[-1].lstrip("0").lstrip(".").replace(".", ""))
            found.setdefault(name, {"city": name, "state": state, "population_k": round(population / 1000)})

    return sorted(found.values(), key=lambda c: -c["population_k"])


async def fetch(url: str) -> str:
    async with build_client() as client:
        verdict = await robots.allowed(client, url)
        if not verdict.allowed:
            raise SystemExit(f"robots.txt forbids {url}")
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        return response.text


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--state", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--html", help="parse a saved copy instead of fetching")
    args = parser.parse_args()

    if args.html:
        with open(args.html, encoding="utf-8") as handle:
            html = handle.read()
    else:
        html = await fetch(args.url)

    cities = parse_page(html, args.state)
    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(cities, handle, ensure_ascii=False, indent=2)

    print(f"{len(cities)} Gemeinden -> {args.out}", file=sys.stderr)
    for city in cities[:5]:
        print(f"  {city['city']:28} {city['population_k']:>5}k", file=sys.stderr)
    print("  ...", file=sys.stderr)
    for city in cities[-3:]:
        print(f"  {city['city']:28} {city['population_k']:>5}k", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
