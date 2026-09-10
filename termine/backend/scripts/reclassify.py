"""Re-apply the vendor fingerprints to survey results already collected.

    python -m scripts.reclassify --jsonl a.jsonl --jsonl b.jsonl

A new vendor signature is worth nothing if it only applies to the next run.
This walks the recorded booking URLs and re-runs the classifier over them, so
recognising a URL shape late — smartCJM's ``/m/<mandant>/extern/calendar`` was
the case that prompted this — reclassifies every city already surveyed without
fetching a single page again.

Only the vendor is touched. The robots verdict stays as it was recorded,
because it was made against the same URL and has not changed.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter

from scripts.sniff_portals import classify


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--jsonl", action="append", required=True, help="survey output (repeatable)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    changes: Counter[str] = Counter()
    for path in args.jsonl:
        with open(path, encoding="utf-8") as handle:
            rows = [json.loads(line) for line in handle if line.strip()]

        touched = 0
        for row in rows:
            before = next((link["vendor"] for link in row["links"] if link.get("vendor")), None)
            for link in row["links"]:
                vendor, supported = classify(link["url"])
                if vendor and link.get("vendor") != vendor:
                    link["vendor"], link["supported"] = vendor, supported
            row["links"].sort(
                key=lambda link: (link.get("supported", False), link.get("vendor") is not None),
                reverse=True,
            )
            after = next((link["vendor"] for link in row["links"] if link.get("vendor")), None)
            if after != before:
                touched += 1
                changes[f"{before or '—'} → {after}"] += 1
                if row["status"] in ("unbekannt", "kein Terminsystem verlinkt") or before:
                    row["status"] = after or row["status"]

        if not args.dry_run:
            with open(path, "w", encoding="utf-8") as handle:
                for row in rows:
                    handle.write(json.dumps(row, ensure_ascii=False) + "\n")
        print(f"{path}: {touched} von {len(rows)} neu eingeordnet", file=sys.stderr)

    for change, count in changes.most_common():
        print(f"  {count:5}  {change}", file=sys.stderr)


if __name__ == "__main__":
    main()
