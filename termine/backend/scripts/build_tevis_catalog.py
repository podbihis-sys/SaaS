"""Turn the TEVIS discovery output into the catalogue data file.

    python -m scripts.build_tevis_catalog --offices tevis_offices.json

Reads what `scripts/discover_tevis.py` found and writes
`app/data/tevis_offices.json`, which `app/catalog/tevis_cities.py` loads.
Before an office is marked scannable, the production robots matcher is asked
about ``<base>/suggest`` — the calendar path the adapter actually polls. The
city survey only checked ``/select2``, and a host is free to allow the landing
page while forbidding the calendar.

Every entry carries ``provider_meta.verified = False``: the adapter has not
yet been run live against these instances. ``scan_enabled`` records the
*permission* (robots allows it); whether the deployment *does* poll is a
separate switch, ``SCANNER_PROVIDERS``, which stays closed until one instance
has been verified by hand. See docs/providers.md.

Each office is tied to a municipality by its Gemeindeschlüssel: a district's
instance is filed on the district seat, which is where its Kreisverwaltung
sits and where the responsibility lookup goes looking for it.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
from pathlib import Path
from urllib.parse import urlparse

from app.providers.base import build_client
from app.providers.robots import robots
from app.providers.taxonomy import classify_authority
from app.services.places import load_register, register_rows
from scripts.register_cities import build_place_index

TARGET = Path(__file__).resolve().parent.parent / "app" / "data" / "tevis_offices.json"


def slug(text: str) -> str:
    text = text.lower()
    for src, dst in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        text = text.replace(src, dst)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def external_id(office: dict) -> str:
    """A stable, unique key for one mandant on one instance.

    Not ``tevis-<city>-md<n>``: the vendor hosts many instances under one
    domain, and two of them can carry the same city name and the same mandant
    number — Schwerin's own instance and the Ludwigslust-Parchim district's
    both have an ``md=1``. The instance URL is what distinguishes them, so it
    is what the key is built from.
    """
    parsed = urlparse(office["base_url"])
    host = parsed.netloc.removeprefix("www.")
    return f"tevis-{slug(host + parsed.path)}-md{office['mandant']}"


async def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offices", action="append", required=True, help="discover_tevis JSON (repeatable)")
    parser.add_argument("--out", default=str(TARGET))
    args = parser.parse_args()

    offices: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for path in args.offices:
        with open(path, encoding="utf-8") as handle:
            for outcome in json.load(handle):
                for office in outcome["offices"]:
                    key = (office["base_url"], office["mandant"])
                    if key in seen:
                        continue
                    seen.add(key)
                    offices.append(office)
    offices.sort(key=lambda o: (o["city"], o["name"]))

    register = load_register()
    places = build_place_index(register)
    plz_by_ags = {row["ags"]: row["plz"] for row in register_rows(register)}

    # One robots decision per instance, on the path that matters.
    verdicts: dict[str, tuple[bool, str]] = {}
    async with build_client() as client:
        for base_url in sorted({o["base_url"] for o in offices}):
            verdict = await robots.allowed(client, f"{base_url}/suggest")
            verdicts[base_url] = (verdict.allowed, verdict.reason)

    rows = []
    unplaced: list[str] = []
    for office in offices:
        allowed, reason = verdicts[office["base_url"]]
        ags = places.get(office["city"].lower())
        if ags is None:
            unplaced.append(office["city"])
        rows.append(
            {
                "external_id": external_id(office),
                "base_url": office["base_url"],
                "name": office["name"],
                "authority_type": classify_authority(office["name"]).value,
                "city": office["city"],
                "state": office["state"],
                "ags": ags,
                "postal_code": plz_by_ags.get(ags or ""),
                "booking_url": office["booking_url"],
                "mandant": office["mandant"],
                "scan_enabled": allowed,
                "scan_blocked_reason": (
                    None if allowed else f"robots.txt: {office['base_url']}/suggest {reason}"
                ),
            }
        )

    payload = {
        "source": "scripts/discover_tevis.py",
        "register_stand": register.get("stand"),
        "offices": rows,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=1)

    by_city: dict[str, int] = {}
    for office in offices:
        by_city[office["city"]] = by_city.get(office["city"], 0) + 1
    scannable = sum(1 for row in rows if row["scan_enabled"])
    print(f"wrote {out} — {len(rows)} Ämter in {len(by_city)} Orten, davon {scannable} überwachbar")
    if unplaced:
        print(f"  ohne Gemeindezuordnung: {sorted(set(unplaced))}")


if __name__ == "__main__":
    asyncio.run(main())
