from __future__ import annotations

from datetime import date, timedelta
from urllib.parse import urlencode, urljoin

import httpx

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
from app.providers.html_utils import extract_bookable_dates, extract_time_slots
from app.providers.taxonomy import classify_service

log = get_logger(__name__)


class NetAppointProvider(AppointmentProvider):
    """netAppoint by nubit, common in Schleswig-Holstein and Lower Saxony.

    Everything hangs off one endpoint, ``/netappoint/index.php``, switched by
    an ``m`` (mode) parameter: ``m=suggest`` for the calendar and the day view,
    ``m=overview`` for the service list. The instance is identified by
    ``company``.
    """

    key = Provider.NETAPPOINT
    display_name = "netAppoint (nubit)"
    min_request_interval = 4.0
    min_scan_interval_seconds = 300
    supports_discovery = True

    def _endpoint(self, office: OfficeRef, params: dict[str, str]) -> str:
        merged = {
            "m": params.pop("m", "suggest"),
            "langid": "1",
            "company": str(office.meta.get("company") or office.external_id),
            **params,
        }
        return urljoin(office.base_url, "/netappoint/index.php") + "?" + urlencode(merged)

    async def discover_services(self, client: httpx.AsyncClient, office: OfficeRef) -> list[RawService]:
        url = self._endpoint(office, {"m": "overview"})
        await self.throttle(url)
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"netAppoint service listing failed: {exc}") from exc

        from selectolax.parser import HTMLParser

        tree = HTMLParser(response.text)
        services: list[RawService] = []
        seen: set[str] = set()
        for node in tree.css("input[name^='cnc-'], option[value]"):
            name_attr = node.attributes.get("name") or ""
            external_id = name_attr.removeprefix("cnc-") if name_attr else (node.attributes.get("value") or "")
            if not external_id or not external_id.isdigit() or external_id in seen:
                continue
            label = (node.text() or "").strip() or (node.parent.text() or "").strip() if node.parent else ""
            if not label or len(label) > 200:
                continue
            seen.add(external_id)
            services.append(
                RawService(external_id=external_id, name=label, category=classify_service(label))
            )
        return services

    async def fetch_slots(
        self,
        client: httpx.AsyncClient,
        office: OfficeRef,
        service: ServiceRef,
        date_from: date,
        date_to: date,
    ) -> list[RawSlot]:
        selection = {f"cnc-{service.external_id}": "1"}
        calendar_url = self._endpoint(office, {"m": "suggest", **selection})
        await self.throttle(calendar_url)
        try:
            response = await client.get(calendar_url)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"netAppoint calendar request failed: {exc}") from exc

        if "netappoint" not in response.text.lower() and "cnc-" not in response.text:
            raise ProviderError("netAppoint calendar page had no recognisable structure")

        days = [
            day
            for day in extract_bookable_dates(response.text, class_hints=("ekbBookable", "nat_calendar_active", "buchbar"))
            if date_from <= day <= date_to
        ][:31]

        slots: list[RawSlot] = []
        for day in days:
            day_url = self._endpoint(office, {"m": "suggest", "date": day.isoformat(), **selection})
            await self.throttle(day_url)
            try:
                day_response = await client.get(day_url)
                day_response.raise_for_status()
            except httpx.HTTPError as exc:
                log.warning("netappoint.day_fetch_failed", url=day_url, error=str(exc))
                continue
            slots.extend(
                extract_time_slots(
                    day_response.text,
                    day,
                    office.timezone,
                    base_url=office.base_url,
                    href_must_contain="index.php",
                )
            )
        return sorted(slots, key=lambda s: s.starts_at)

    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        if slot.provider_ref:
            return slot.provider_ref
        local_day = (slot.starts_at + timedelta(hours=1)).date()
        return self._endpoint(
            office,
            {"m": "suggest", "date": local_day.isoformat(), f"cnc-{service.external_id}": "1"},
        )
