"""Turn the official register into work lists for the discovery scripts.

    python -m scripts.register_cities --min-population 20000 --out big.json
    python -m scripts.register_cities --kreise --out kreise.json

The register (``app/data/gv100ad.json``) is the only complete list of German
municipalities, so it is what decides who gets surveyed — not a hand-kept list
that silently omits half the country. Output is the shape
``scripts/survey_cities.py --cities-file`` and ``scripts/sniff_portals.py``
read: ``{city, state, population_k, kind, ags, verband, hosts}``.

Gemeindefreie Gebiete (Textkennzeichen 65 and 66) are left out: 196 unpopulated
forests and lakes with no administration and nothing to book.

With ``--kreise`` the list is the 401 Kreise instead. They matter as much as
the municipalities: a kreisangehörige Gemeinde does not register vehicles,
issue driving licences or handle residence permits — its Kreis does. Surveying
one Kreis therefore covers every village in it.
"""

from __future__ import annotations

import argparse
import json
import sys

from app.services.places import load_register

#: Textkennzeichen of areas without an administration.
UNINHABITED = {"65", "66"}


def gemeinde_entries(register: dict, minimum: int, maximum: int | None) -> list[dict]:
    fields = register["fields"]
    laender = register["laender"]
    verbaende = register.get("verbaende", {})
    entries = []
    for values in register["gemeinden"]:
        row = dict(zip(fields, values, strict=True))
        if row["kind"] in UNINHABITED:
            continue
        if row["population"] < minimum:
            continue
        if maximum is not None and row["population"] >= maximum:
            continue
        verband = verbaende.get(row["ags"][:5] + row["verband"], "")
        entries.append(
            {
                "city": row["short_name"],
                "state": laender.get(row["ags"][:2], ""),
                "population_k": round(row["population"] / 1000),
                "population": row["population"],
                "kind": row["kind"],
                "ags": row["ags"],
                # Only a *shared* administration is worth following; a
                # municipality that is its own Verband adds nothing.
                "verband": verband if verband and verband != row["name"] else None,
                "hosts": [],
            }
        )
    entries.sort(key=lambda e: -e["population"])
    return entries


def kreis_entries(register: dict) -> list[dict]:
    laender = register["laender"]
    entries = []
    for key, kreis in sorted(register["kreise"].items()):
        # A kreisfreie Stadt appears as its own "Kreis"; it is already in the
        # municipality list, where its population and AGS are right.
        if kreis["kind"] in ("41", "42"):
            continue
        entries.append(
            {
                "city": kreis["name"],
                "state": laender.get(key[:2], ""),
                "population_k": 0,
                "population": 0,
                "kind": kreis["kind"],
                "ags": key,
                "seat": kreis["seat"] or None,
                "verband": None,
                "hosts": [],
            }
        )
    return entries


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True)
    parser.add_argument("--min-population", type=int, default=0)
    parser.add_argument("--max-population", type=int, default=None)
    parser.add_argument("--kreise", action="store_true", help="the 401 Kreise instead of municipalities")
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    register = load_register()
    entries = (
        kreis_entries(register)
        if args.kreise
        else gemeinde_entries(register, args.min_population, args.max_population)
    )
    if args.limit:
        entries = entries[: args.limit]

    with open(args.out, "w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False, indent=2)
    print(f"{len(entries)} Einträge -> {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
