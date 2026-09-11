"""What the catalogue actually covers, by Bundesland and by vendor.

    python -m scripts.coverage_report --sniff sniff_all.jsonl --sniff sniff_kreise.jsonl

Counting catalogue rows flatters the result: 200 offices in one city look like
coverage while the next state has none. What matters is how many people live
in a municipality we can send somewhere useful, and whether that somewhere can
be watched or only linked. This prints both, per state, from the register and
the survey output — so the numbers in the docs come from data and can be
re-derived after every run rather than counted by hand.

Three states a municipality can be in:

* **überwachbar** — an office with ``scan_enabled`` (an enumerated TEVIS
  instance, in practice), so a watch on it can fire.
* **verlinkt** — a booking portal was found, but no adapter may or can read it.
  The user is sent to the right page.
* **offen** — nothing found: the site was unreachable, carried no booking link,
  or the town has no online appointments at all.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict

from app.catalog.portals import load_portals
from app.catalog.tevis_cities import load_tevis_offices
from app.services.places import load_register, register_rows


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sniff", action="append", default=[], help="sniff_portals JSONL (repeatable)")
    parser.add_argument("--json", metavar="PATH", help="also write the numbers as JSON")
    parser.add_argument("--markdown", action="store_true", help="print the table for the docs")
    args = parser.parse_args()

    register = load_register()
    rows = {row["ags"]: row for row in register_rows(register)}

    watchable: set[str] = {
        entry["municipality_ags"]
        for entry in load_tevis_offices()
        if entry["scan_enabled"] and entry["municipality_ags"]
    }
    linked: set[str] = {entry["municipality_ags"] for entry in load_portals()}
    linked -= watchable

    surveyed: set[str] = set()
    vendors: Counter[str] = Counter()
    statuses: Counter[str] = Counter()
    for path in args.sniff:
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                row = json.loads(line)
                statuses[row["status"]] += 1
                if row.get("ags") in rows:
                    surveyed.add(row["ags"])
                for link in row.get("links", []):
                    if link.get("vendor"):
                        vendors[link["vendor"]] += 1
                        break

    by_state: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for ags, row in rows.items():
        state = by_state[row["state"]]
        state["gemeinden"] += 1
        state["einwohner"] += row["population"]
        if ags in watchable:
            state["ueberwachbar"] += 1
            state["einwohner_ueberwachbar"] += row["population"]
        elif ags in linked:
            state["verlinkt"] += 1
            state["einwohner_verlinkt"] += row["population"]
        if ags in surveyed:
            state["geprueft"] += 1

    if args.markdown:
        print("| Bundesland | Gemeinden | überwachbar | verlinkt | Einwohner erreicht |")
        print("| --- | ---: | ---: | ---: | ---: |")
        for state in sorted(by_state):
            s = by_state[state]
            reached = s["einwohner_ueberwachbar"] + s["einwohner_verlinkt"]
            share = 100 * reached / s["einwohner"] if s["einwohner"] else 0
            print(f"| {state} | {s['gemeinden']} | {s['ueberwachbar']} | {s['verlinkt']} | {share:.0f} % |")
        grand = sum(v["einwohner"] for v in by_state.values())
        got = sum(v["einwohner_ueberwachbar"] + v["einwohner_verlinkt"] for v in by_state.values())
        print(
            f"| **gesamt** | **{sum(v['gemeinden'] for v in by_state.values())}** | "
            f"**{sum(v['ueberwachbar'] for v in by_state.values())}** | "
            f"**{sum(v['verlinkt'] for v in by_state.values())}** | **{100 * got / grand:.0f} %** |"
        )
        print()

    header = f"{'Bundesland':26} {'Gem.':>6} {'gepr.':>6} {'überw.':>7} {'verl.':>6} {'% Einw. erreicht':>17}"
    print(header)
    print("-" * len(header))
    total: dict[str, int] = defaultdict(int)
    for state in sorted(by_state):
        s = by_state[state]
        reached = s["einwohner_ueberwachbar"] + s["einwohner_verlinkt"]
        share = 100 * reached / s["einwohner"] if s["einwohner"] else 0
        print(
            f"{state:26} {s['gemeinden']:6} {s['geprueft']:6} {s['ueberwachbar']:7} "
            f"{s['verlinkt']:6} {share:16.1f}%"
        )
        for key, value in s.items():
            total[key] += value

    reached = total["einwohner_ueberwachbar"] + total["einwohner_verlinkt"]
    share = 100 * reached / total["einwohner"] if total["einwohner"] else 0
    print("-" * len(header))
    print(
        f"{'gesamt':26} {total['gemeinden']:6} {total['geprueft']:6} {total['ueberwachbar']:7} "
        f"{total['verlinkt']:6} {share:16.1f}%"
    )

    print("\nAnbieter (je Kommune der beste Fund):")
    for vendor, count in vendors.most_common():
        print(f"  {count:5}  {vendor}")
    print("\nErgebnis der Vermessung:")
    for status, count in statuses.most_common():
        print(f"  {count:5}  {status}")

    if args.json:
        payload = {
            "by_state": {state: dict(values) for state, values in by_state.items()},
            "total": dict(total),
            "vendors": dict(vendors),
            "statuses": dict(statuses),
        }
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=1)
        print(f"\nwrote {args.json}")


if __name__ == "__main__":
    main()
