from __future__ import annotations

import re
from datetime import UTC, date, datetime, timedelta
from urllib.parse import urlencode, urljoin
from zoneinfo import ZoneInfo

import httpx
from selectolax.parser import HTMLParser

from app.core.errors import ProviderError
from app.logging_config import get_logger
from app.models.enums import Provider
from app.providers.base import (
    AppointmentProvider,
    OfficeRef,
    RawService,
    RawSlot,
    ServiceRef,
)
from app.providers.taxonomy import classify_service

log = get_logger(__name__)

BERLIN_TZ = ZoneInfo("Europe/Berlin")

#: `/terminvereinbarung/termin/time/1699999200/` — the trailing integer is the
#: Unix timestamp of midnight Berlin time on a bookable day.
_DAY_LINK_RE = re.compile(r"/terminvereinbarung/termin/time/(\d{9,12})/?")
_TIME_RE = re.compile(r"\b(\d{1,2}):(\d{2})\b")


class BerlinZmsProvider(AppointmentProvider):
    """Berlin's ZMS (Zeit-Management-System) behind service.berlin.de.

    ZMS has no documented public API. What it does have is a stable,
    server-rendered two-step flow — a month calendar of bookable days, then a
    page of times for one day — which is what this adapter reads.

    Because there is no contract to rely on, parsing is deliberately loose: days
    are found by their URL shape and times by a clock pattern, rather than by
    CSS classes that Berlin can rename without notice. When the shape changes,
    ``fetch_slots`` raises ``ProviderError`` instead of silently reporting that
    nothing is free — a scanner that reports "no slots" when it is actually
    broken is worse than one that reports an error.
    """

    key = Provider.BERLIN_ZMS
    display_name = "Berlin service.berlin.de (ZMS)"
    # Berlin's calendar is heavily polled by third-party tools. One request per
    # 5 seconds per host, and a full rescan of a service no more than every
    # 3 minutes.
    min_request_interval = 5.0
    min_scan_interval_seconds = 180
    supports_discovery = False

    async def discover_services(self, client: httpx.AsyncClient, office: OfficeRef) -> list[RawService]:
        """ZMS service ids come from the office catalogue, not from a listing.

        Each Berlin service has a numeric ``dienstleistung`` id that is part of
        its public URL (``service.berlin.de/dienstleistung/120686/``). Those are
        curated in the seed catalogue, so discovery is a no-op here.
        """
        services = office.meta.get("services") or []
        return [
            RawService(
                external_id=str(s["id"]),
                name=s["name"],
                category=classify_service(s["name"]),
                duration_minutes=s.get("duration_minutes"),
            )
            for s in services
        ]

    def _calendar_url(self, office: OfficeRef, service: ServiceRef) -> str:
        params = {
            "termin": "1",
            "anliegen[]": service.external_id,
            "dienstleisterlist": office.external_id,
            "herkunft": "1",
        }
        return urljoin(office.base_url, "/terminvereinbarung/termin/day/") + "?" + urlencode(params)

    async def fetch_slots(
        self,
        client: httpx.AsyncClient,
        office: OfficeRef,
        service: ServiceRef,
        date_from: date,
        date_to: date,
    ) -> list[RawSlot]:
        calendar_url = self._calendar_url(office, service)
        await self.throttle(calendar_url)
        try:
            response = await client.get(calendar_url)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"ZMS calendar request failed: {exc}") from exc

        day_timestamps = self._parse_bookable_days(response.text)
        if day_timestamps is None:
            raise ProviderError("ZMS calendar page had no recognisable structure")

        slots: list[RawSlot] = []
        for timestamp in day_timestamps:
            day = datetime.fromtimestamp(timestamp, BERLIN_TZ).date()
            if day < date_from or day > date_to:
                continue
            day_url = urljoin(office.base_url, f"/terminvereinbarung/termin/time/{timestamp}/")
            await self.throttle(day_url)
            try:
                day_response = await client.get(day_url)
                day_response.raise_for_status()
            except httpx.HTTPError as exc:
                # One unreadable day should not void an otherwise good scan.
                log.warning("zms.day_fetch_failed", url=day_url, error=str(exc))
                continue
            slots.extend(self._parse_day(day_response.text, day, office))

        return sorted(slots, key=lambda s: s.starts_at)

    def _parse_bookable_days(self, html: str) -> list[int] | None:
        """Extract Unix timestamps of bookable days from the month calendar.

        Returns ``None`` when the page does not look like a ZMS calendar at all,
        and an empty list when it is a valid calendar with nothing free.
        """
        tree = HTMLParser(html)
        if tree.css_first("table.calendar") is None and "terminvereinbarung" not in html:
            return None

        timestamps: list[int] = []
        for node in tree.css("a"):
            href = node.attributes.get("href") or ""
            match = _DAY_LINK_RE.search(href)
            if not match:
                continue
            # ZMS renders non-bookable days as plain cells; only bookable ones
            # carry the link, but the class is checked as a second signal when
            # it is present.
            parent_class = (node.parent.attributes.get("class") if node.parent else None) or ""
            if parent_class and "buchbar" not in parent_class and "frei" not in parent_class:
                continue
            timestamps.append(int(match.group(1)))

        return sorted(set(timestamps))

    def _parse_day(self, html: str, day: date, office: OfficeRef) -> list[RawSlot]:
        tree = HTMLParser(html)
        slots: list[RawSlot] = []
        seen: set[str] = set()

        for node in tree.css("a"):
            text = (node.text() or "").strip()
            match = _TIME_RE.search(text)
            if not match:
                continue
            hour, minute = int(match.group(1)), int(match.group(2))
            if hour > 23 or minute > 59:
                continue
            href = node.attributes.get("href") or ""
            if "termin" not in href:
                continue

            key = f"{hour:02d}:{minute:02d}"
            if key in seen:
                continue
            seen.add(key)

            local = datetime(day.year, day.month, day.day, hour, minute, tzinfo=BERLIN_TZ)
            slots.append(
                RawSlot(
                    starts_at=local.astimezone(UTC),
                    ends_at=local.astimezone(UTC) + timedelta(minutes=15),
                    capacity=1,
                    provider_ref=urljoin(office.base_url, href),
                )
            )
        return slots

    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        # provider_ref is already the absolute URL of the booking form for this
        # exact time, which is the deepest link ZMS offers.
        if slot.provider_ref:
            return slot.provider_ref
        return self._calendar_url(office, service)
