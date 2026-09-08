"""Turn the portal survey into the linkable catalogue, ``app/data/portals.json``.

    python -m scripts.build_portal_catalog --sniff sniff_all.jsonl --sniff sniff_kreise.jsonl

Every municipality whose website links to an appointment system becomes one
catalogue entry: provider ``portal``, ``scan_enabled=False``, and the official
booking URL. That is the honest shape of what the survey establishes — we know
*where* the authority takes appointments, not *when* it has one free.

TEVIS instances are excluded here when ``--exclude-tevis`` is given, because
``scripts/discover_tevis.py`` enumerates their offices properly and those rows
carry the real provider. A TEVIS instance nobody has enumerated is still worth
a portal row, which is the default.

Rows are keyed on the Amtlicher Gemeindeschlüssel, so re-running the survey
updates a municipality in place instead of adding a second office for it.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

from app.models.enums import AuthorityType
from app.providers.taxonomy import classify_authority
from app.services.places import load_register, register_rows

TARGET = Path(__file__).resolve().parent.parent / "app" / "data" / "portals.json"

#: What the app tells the user about why we cannot watch this one for them.
NO_ADAPTER = "Kein Adapter für {vendor}: Termine können hier nur direkt beim Amt gebucht werden."
NOT_VERIFIED = "Noch nicht verifiziert: Termine hier bitte direkt beim Amt buchen."
ROBOTS_BLOCKED = "Das Buchungssystem untersagt automatisiertes Abrufen (robots.txt)."


def authority_for(url: str, city: str) -> AuthorityType:
    """Guess the authority from the booking URL's own words.

    "…/termine/remscheid/auslaenderbehoerde" says what it is; most portals say
    nothing, and the citizen service office is the right default because that
    is what a municipal booking portal serves.
    """
    words = urlparse(url).path.replace("-", " ").replace("/", " ")
    guess = classify_authority(f"{words} {urlparse(url).netloc.replace('.', ' ')}")
    return guess if guess != AuthorityType.SONSTIGES else AuthorityType.BUERGERAMT


def name_for(row: dict, kreis_names: set[str]) -> str:
    city = row["city"]
    if city in kreis_names:
        return f"Terminvergabe {city} (Kreisverwaltung)"
    return f"Terminvergabe {city}"


def load_rows(paths: list[str]) -> dict[str, dict]:
    """Best portal per municipality, keyed by AGS; later files win."""
    best: dict[str, dict] = {}
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                links = [link for link in row.get("links", []) if link.get("vendor")]
                if not links or not row.get("ags"):
                    continue
                # The survey already ranks; the first link is the best one.
                best[row["ags"]] = {**row, "link": links[0]}
    return best


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sniff", action="append", required=True, help="sniff_portals JSONL (repeatable)")
    parser.add_argument(
        "--exclude-tevis",
        action="store_true",
        help="leave out instances that discover_tevis enumerates as real offices",
    )
    parser.add_argument("--out", default=str(TARGET))
    args = parser.parse_args()

    register = load_register()
    municipalities = {row["ags"]: row for row in register_rows(register)}
    kreis_names = {kreis["name"] for kreis in register["kreise"].values()}
    laender = register["laender"]

    # A Kreis is surveyed under its five-digit key, but an office row has to
    # carry the eight-digit AGS of a Gemeinde — the one its seat sits in — or
    # the responsibility lookup will never find it.
    seat_ags: dict[str, str] = {}
    for key, kreis in register["kreise"].items():
        seat = (kreis.get("seat") or "").strip()
        if not seat:
            continue
        for row in municipalities.values():
            if row["district_ags"] == key and row["short_name"] == seat:
                seat_ags[key] = row["ags"]
                break

    rows = load_rows(args.sniff)
    portals = []
    vendors: Counter[str] = Counter()
    for ags, row in sorted(rows.items()):
        link = row["link"]
        vendor = link["vendor"]
        if args.exclude_tevis and vendor == "tevis":
            continue
        parsed = urlparse(link["url"])
        office_ags = ags if len(ags) == 8 else seat_ags.get(ags)
        if office_ags is None:
            # A Kreis whose seat we could not place: the portal is real, but
            # nothing would ever surface it, so it is not worth a row.
            print(f"  Sitz nicht auflösbar, übersprungen: {row['city']} ({ags})", file=sys.stderr)
            continue
        register_row = municipalities.get(office_ags)
        postal_code = register_row["plz"] if register_row else None
        state = row.get("state") or laender.get(ags[:2], "")

        if link.get("allowed") is False:
            reason = ROBOTS_BLOCKED
        elif vendor in ("tevis", "netappoint", "etermin", "berlin_zms"):
            reason = NOT_VERIFIED
        else:
            reason = NO_ADAPTER.format(vendor=vendor)

        vendors[vendor] += 1
        portals.append(
            {
                "external_id": f"portal-{ags}",
                "ags": office_ags,
                "city": row["city"],
                "state": state,
                "postal_code": postal_code,
                "name": name_for(row, kreis_names),
                "authority_type": authority_for(link["url"], row["city"]).value,
                "base_url": f"{parsed.scheme}://{parsed.netloc}",
                "booking_url": link["url"],
                "vendor": vendor,
                "robots_allowed": link.get("allowed"),
                "scan_blocked_reason": reason,
            }
        )

    payload = {
        "source": "scripts/sniff_portals.py",
        "register_stand": register.get("stand"),
        "portals": portals,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=1)

    print(f"{len(portals)} Portale -> {out}", file=sys.stderr)
    for vendor, count in vendors.most_common():
        print(f"  {count:5}  {vendor}", file=sys.stderr)


if __name__ == "__main__":
    main()
