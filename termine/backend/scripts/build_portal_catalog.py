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
from scripts.register_cities import build_place_index

TARGET = Path(__file__).resolve().parent.parent / "app" / "data" / "portals.json"

#: What the app tells the user about why we cannot watch this one for them.
NO_ADAPTER = "Kein Adapter für {vendor}: Termine können hier nur direkt beim Amt gebucht werden."
NOT_VERIFIED = "Noch nicht verifiziert: Termine hier bitte direkt beim Amt buchen."
ROBOTS_BLOCKED = "Das Buchungssystem untersagt automatisiertes Abrufen (robots.txt)."


def authority_for(url: str, is_kreis: bool = False) -> AuthorityType:
    """Guess the authority from the booking URL's own words.

    "…/termine/remscheid/auslaenderbehoerde" says what it is. Most portals say
    nothing, and then the default depends on whose portal it is: a
    municipality's serves its citizens' office, while a Kreis portal covers
    vehicle registration, driving licences and residence permits at once —
    calling that a Bürgeramt would file the district's portal under the
    citizens' office of its seat, where it does not belong. It stays
    "Weitere Ämter", and the responsibility view offers it as the district's
    general portal.
    """
    words = urlparse(url).path.replace("-", " ").replace("/", " ")
    guess = classify_authority(f"{words} {urlparse(url).netloc.replace('.', ' ')}")
    if guess != AuthorityType.SONSTIGES:
        return guess
    return AuthorityType.SONSTIGES if is_kreis else AuthorityType.BUERGERAMT


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
        help="leave out every TEVIS instance, enumerated or not",
    )
    parser.add_argument(
        "--exclude-ags-from",
        metavar="PATH",
        help=(
            "app/data/tevis_offices.json: municipalities whose offices are already "
            "catalogued individually get no generic portal row"
        ),
    )
    parser.add_argument("--out", default=str(TARGET))
    args = parser.parse_args()

    register = load_register()
    municipalities = {row["ags"]: row for row in register_rows(register)}
    kreis_names = {kreis["name"] for kreis in register["kreise"].values()}
    laender = register["laender"]

    # A Kreis is surveyed under its five-digit key, but an office row has to
    # carry the eight-digit AGS of a Gemeinde — the one its seat sits in — or
    # the responsibility lookup will never find it. The shared index knows the
    # awkward cases (a seat outside its own district, a truncated name).
    names = build_place_index(register)
    seat_ags: dict[str, str] = {}
    for key, kreis in register["kreise"].items():
        if ags := names.get(kreis["name"].lower()):
            seat_ags[key] = ags

    # A municipality whose offices are enumerated one by one does not need a
    # generic "Terminvergabe <Ort>" row as well: that would list the same
    # system twice, once watchable and once not.
    already: set[str] = set()
    if args.exclude_ags_from:
        with open(args.exclude_ags_from, encoding="utf-8") as handle:
            already = {row["ags"] for row in json.load(handle)["offices"] if row.get("ags")}

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
        if office_ags in already:
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
                "authority_type": authority_for(link["url"], is_kreis=len(ags) == 5).value,
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
