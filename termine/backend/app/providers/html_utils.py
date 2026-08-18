from __future__ import annotations

import re
from datetime import UTC, date, datetime, timedelta
from urllib.parse import urljoin
from zoneinfo import ZoneInfo

from selectolax.parser import HTMLParser

from app.providers.base import RawSlot

_TIME_RE = re.compile(r"\b([01]?\d|2[0-3]):([0-5]\d)\b")
_ISO_DATETIME_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})[T ]([01]\d|2[0-3]):([0-5]\d)\b")
_ISO_DATE_RE = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")


def extract_time_slots(
    html: str,
    day: date,
    timezone: str,
    *,
    base_url: str,
    slot_duration_minutes: int = 15,
    href_must_contain: str | None = None,
) -> list[RawSlot]:
    """Pull clock times out of a rendered day view.

    German booking systems all render a day as a grid of clickable times. The
    markup differs per vendor and changes without warning, so this looks for
    the one thing that is stable — an anchor or button whose visible text is a
    time of day — instead of vendor-specific CSS classes.

    ``href_must_contain`` narrows matches to links that plausibly lead into the
    booking flow, which keeps navigation chrome ("Öffnungszeiten 08:00") out of
    the results.
    """
    tz = ZoneInfo(timezone)
    tree = HTMLParser(html)
    slots: dict[str, RawSlot] = {}

    for node in tree.css("a, button"):
        text = (node.text() or "").strip()
        match = _TIME_RE.search(text)
        if not match:
            continue

        href = node.attributes.get("href") or node.attributes.get("data-href") or ""
        if href_must_contain is not None and href_must_contain not in href:
            continue
        if node.tag == "a" and not href:
            continue

        hour, minute = int(match.group(1)), int(match.group(2))
        key = f"{hour:02d}:{minute:02d}"
        if key in slots:
            continue

        local = datetime(day.year, day.month, day.day, hour, minute, tzinfo=tz)
        starts_at = local.astimezone(UTC)
        slots[key] = RawSlot(
            starts_at=starts_at,
            ends_at=starts_at + timedelta(minutes=slot_duration_minutes),
            capacity=1,
            provider_ref=urljoin(base_url, href) if href else None,
        )

    return sorted(slots.values(), key=lambda s: s.starts_at)


def extract_iso_datetimes(
    html: str,
    timezone: str,
    *,
    slot_duration_minutes: int = 15,
) -> list[RawSlot]:
    """Pull full ISO timestamps out of a page or JSON-in-HTML payload.

    Some vendors embed the whole month as ``2026-03-04T09:15`` strings in a
    data attribute or inline script, which is far more reliable than the visual
    grid when it is present.
    """
    tz = ZoneInfo(timezone)
    slots: dict[str, RawSlot] = {}

    for match in _ISO_DATETIME_RE.finditer(html):
        day = date.fromisoformat(match.group(1))
        hour, minute = int(match.group(2)), int(match.group(3))
        local = datetime(day.year, day.month, day.day, hour, minute, tzinfo=tz)
        starts_at = local.astimezone(UTC)
        key = starts_at.isoformat()
        if key in slots:
            continue
        slots[key] = RawSlot(
            starts_at=starts_at,
            ends_at=starts_at + timedelta(minutes=slot_duration_minutes),
            capacity=1,
        )

    return sorted(slots.values(), key=lambda s: s.starts_at)


def extract_bookable_dates(html: str, *, class_hints: tuple[str, ...] = ()) -> list[date]:
    """Find the days a month calendar marks as having availability.

    ``class_hints`` are vendor CSS class fragments ("buchbar", "ekbBookable").
    When a hint matches an element's own or its parent's class the date inside
    it is taken; when no element carries any hint, every ISO date on the page is
    returned so a redesigned calendar degrades to "check every day" rather than
    to "nothing is free".
    """
    tree = HTMLParser(html)
    found: set[date] = set()
    hint_seen = False

    for node in tree.css("*"):
        classes = (node.attributes.get("class") or "").lower()
        parent_classes = (node.parent.attributes.get("class") if node.parent else "") or ""
        combined = f"{classes} {parent_classes.lower()}"
        if not any(hint.lower() in combined for hint in class_hints):
            continue
        hint_seen = True
        haystack = " ".join(
            filter(None, [node.attributes.get("href"), node.attributes.get("data-date"), node.text()])
        )
        for match in _ISO_DATE_RE.finditer(haystack):
            found.add(date.fromisoformat(match.group(1)))

    if not hint_seen:
        for match in _ISO_DATE_RE.finditer(html):
            found.add(date.fromisoformat(match.group(1)))

    return sorted(found)
