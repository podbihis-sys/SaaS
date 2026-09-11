"""Re-apply the vendor fingerprints to survey results already collected.

    python -m scripts.reclassify --jsonl a.jsonl --jsonl b.jsonl
    python -m scripts.reclassify --jsonl a.jsonl --verify      # also re-reads pages

A new vendor signature is worth nothing if it only applies to the next run.
This walks the recorded booking URLs and re-runs the classifier over them, so
recognising a URL shape late — smartCJM's ``/m/<mandant>/extern/calendar`` was
the case that prompted this — reclassifies every city already surveyed without
fetching a single page again.

**A URL pass alone can only ever widen a signature.** The survey assigns a
vendor from the URL *or* from the page body (``survey_cities.fingerprint``
searches both), and the body is not kept. So a link labelled from its body —
``https://www.landkreis-lueneburg.de/``, whose page says TEVISWEB and whose
URL says nothing — reads here exactly like a label that has since stopped
being true. Clearing both would throw away real offices; keeping both means a
signature that was *tightened* never takes effect, which is how fourteen
municipalities stayed labelled as running Berlin's software after the pattern
that mislabelled them was fixed.

``--verify`` settles it the only way it can be settled: where the URL does not
explain the vendor, the page is fetched (robots-checked) and fingerprinted
again. That is a couple of hundred requests against eleven thousand
municipalities, because almost every label *is* explained by its URL.

The verdict is recorded as ``via``, which says where the label came from — but
a body verdict is re-checked on the next ``--verify`` all the same, since the
body was fingerprinted with the signature table as it stood that day and the
page itself was never kept.

Only the vendor is touched. The robots verdict stays as it was recorded,
because it was made against the same URL and has not changed.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from collections import Counter
from typing import Any

import httpx

from app.config import settings
from app.providers.robots import robots
from scripts.sniff_portals import classify
from scripts.survey_cities import fingerprint

#: How the vendor on a link was established. Recorded so that a later pass
#: knows whether it may re-derive the label or must go and look.
VIA_URL = "url"
VIA_BODY = "body"


def reclassify_by_url(rows: list[dict[str, Any]]) -> tuple[Counter[str], int]:
    """Apply the current signatures to every recorded URL."""
    changes: Counter[str] = Counter()
    touched = 0
    for row in rows:
        before = best_vendor(row)
        for link in row["links"]:
            vendor, supported = classify(link["url"])
            if vendor:
                if link.get("vendor") != vendor:
                    link["vendor"], link["supported"] = vendor, supported
                link["via"] = VIA_URL
        sort_links(row)
        after = best_vendor(row)
        if after != before:
            touched += 1
            changes[f"{before or '—'} → {after or '—'}"] += 1
            set_status(row, before, after)
    return changes, touched


def unexplained(row: dict[str, Any]) -> list[dict[str, Any]]:
    """Links carrying a vendor that the URL alone does not account for."""
    return [link for link in row["links"] if link.get("vendor") and classify(link["url"])[0] is None]


async def verify(rows: list[dict[str, Any]], concurrency: int) -> tuple[Counter[str], int]:
    """Re-read the pages whose label the URL does not explain.

    A page that cannot be read is left exactly as it was: an unreachable host
    is no evidence either way, and dropping an office because its server was
    briefly down is the mistake this whole pass exists to avoid.
    """
    pending = [(row, link) for row in rows for link in unexplained(row)]
    if not pending:
        return Counter(), 0

    changes: Counter[str] = Counter()
    touched = 0
    sem = asyncio.Semaphore(concurrency)
    headers = {"User-Agent": settings.HTTP_USER_AGENT}

    async with httpx.AsyncClient(
        follow_redirects=True, headers=headers, timeout=httpx.Timeout(15.0, connect=5.0)
    ) as client:

        async def look(link: dict[str, Any]) -> str | None:
            """The vendor the page itself claims, or None if it cannot be read."""
            async with sem:
                try:
                    verdict = await robots.allowed(client, link["url"])
                    if not verdict.allowed:
                        return None
                    response = await client.get(link["url"])
                except httpx.HTTPError:
                    return None
                if response.status_code >= 400:
                    return None
                vendor, supported = fingerprint(str(response.url), response.text[:200_000])
                link["supported"] = supported
                return vendor or ""

        results = await asyncio.gather(*(look(link) for _, link in pending))

    changed_rows: dict[int, tuple[str | None, dict[str, Any]]] = {}
    for (row, link), found in zip(pending, results, strict=True):
        if found is None:  # unreadable — no evidence, no change
            continue
        changed_rows.setdefault(id(row), (best_vendor(row), row))
        link["via"] = VIA_BODY
        link["vendor"] = found or None
        if not found:
            link["supported"] = False

    for before, row in changed_rows.values():
        sort_links(row)
        after = best_vendor(row)
        if after != before:
            touched += 1
            changes[f"{before or '—'} → {after or '—'}"] += 1
            set_status(row, before, after)
    return changes, touched


def best_vendor(row: dict[str, Any]) -> str | None:
    return next((link["vendor"] for link in row["links"] if link.get("vendor")), None)


def sort_links(row: dict[str, Any]) -> None:
    row["links"].sort(
        key=lambda link: (link.get("supported", False), link.get("vendor") is not None),
        reverse=True,
    )


def set_status(row: dict[str, Any], before: str | None, after: str | None) -> None:
    if after:
        if row["status"] in ("unbekannt", "kein Terminsystem verlinkt") or before:
            row["status"] = after
    elif before and row["status"] == before:
        # The label that named this row is gone; say so rather than keep a
        # vendor name as the status of a municipality with no booking system.
        row["status"] = "kein Terminsystem verlinkt"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--jsonl", action="append", required=True, help="survey output (repeatable)")
    parser.add_argument(
        "--verify",
        action="store_true",
        help="re-read the pages whose vendor the URL does not explain",
    )
    parser.add_argument("--concurrency", type=int, default=12)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    changes: Counter[str] = Counter()
    for path in args.jsonl:
        with open(path, encoding="utf-8") as handle:
            rows = [json.loads(line) for line in handle if line.strip()]

        url_changes, touched = reclassify_by_url(rows)
        changes.update(url_changes)

        if args.verify:
            open_links = sum(len(unexplained(row)) for row in rows)
            print(f"{path}: {open_links} Links werden nachgelesen", file=sys.stderr)
            body_changes, more = asyncio.run(verify(rows, args.concurrency))
            changes.update(body_changes)
            touched += more

        if not args.dry_run:
            with open(path, "w", encoding="utf-8") as handle:
                for row in rows:
                    handle.write(json.dumps(row, ensure_ascii=False) + "\n")
        print(f"{path}: {touched} von {len(rows)} neu eingeordnet", file=sys.stderr)

    for change, count in changes.most_common():
        print(f"  {count:5}  {change}", file=sys.stderr)


if __name__ == "__main__":
    main()
