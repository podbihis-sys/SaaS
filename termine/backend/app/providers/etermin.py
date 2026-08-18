from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from typing import Any
from urllib.parse import urlencode, urljoin
from zoneinfo import ZoneInfo

import httpx

from app.core.errors import ProviderError
from app.models.enums import Provider
from app.providers.base import (
    AppointmentProvider,
    OfficeRef,
    RawService,
    RawSlot,
    ServiceRef,
)
from app.providers.taxonomy import classify_service


class ETerminProvider(AppointmentProvider):
    """eTermin, a hosted booking SaaS used by smaller municipalities.

    Unlike the scraped providers, eTermin publishes a documented JSON API — but
    it is key-gated per customer. An authority that wants to be covered has to
    issue an API key, which is stored in ``Office.provider_meta['api_key']``.
    Offices without one are skipped rather than scraped, because eTermin's terms
    treat the widget as off-limits to automated clients.
    """

    key = Provider.ETERMIN
    display_name = "eTermin"
    min_request_interval = 1.0
    min_scan_interval_seconds = 120
    supports_discovery = True

    def _api(self, office: OfficeRef, path: str, params: dict[str, Any]) -> str:
        api_key = office.meta.get("api_key")
        if not api_key:
            raise ProviderError("eTermin office has no API key configured")
        query = {"apikey": api_key, **{k: v for k, v in params.items() if v is not None}}
        return urljoin(office.base_url, path) + "?" + urlencode(query)

    async def _get_json(self, client: httpx.AsyncClient, url: str) -> Any:
        await self.throttle(url)
        try:
            response = await client.get(url, headers={"Accept": "application/json"})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise ProviderError(f"eTermin request failed: {exc}") from exc
        except ValueError as exc:
            raise ProviderError("eTermin returned a non-JSON body") from exc

    async def discover_services(self, client: httpx.AsyncClient, office: OfficeRef) -> list[RawService]:
        url = self._api(office, "/api/services", {"calendarid": office.meta.get("calendar_id")})
        payload = await self._get_json(client, url)
        entries = payload.get("services", payload) if isinstance(payload, dict) else payload
        if not isinstance(entries, list):
            raise ProviderError("eTermin service listing had an unexpected shape")

        services: list[RawService] = []
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            external_id = str(entry.get("id") or entry.get("serviceid") or "").strip()
            name = str(entry.get("name") or entry.get("title") or "").strip()
            if not external_id or not name:
                continue
            services.append(
                RawService(
                    external_id=external_id,
                    name=name,
                    category=classify_service(name),
                    duration_minutes=entry.get("duration"),
                )
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
        url = self._api(
            office,
            "/api/appointments/getfreeslots",
            {
                "serviceid": service.external_id,
                "calendarid": office.meta.get("calendar_id"),
                "from": date_from.isoformat(),
                "to": date_to.isoformat(),
            },
        )
        payload = await self._get_json(client, url)
        entries = payload.get("slots", payload) if isinstance(payload, dict) else payload
        if not isinstance(entries, list):
            raise ProviderError("eTermin slot listing had an unexpected shape")

        tz = ZoneInfo(office.timezone)
        slots: list[RawSlot] = []
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            raw_start = entry.get("start") or entry.get("datetime") or entry.get("from")
            if not raw_start:
                continue
            try:
                parsed = datetime.fromisoformat(str(raw_start).replace("Z", "+00:00"))
            except ValueError:
                continue
            # eTermin returns local wall time without an offset for most tenants.
            starts_at = (parsed if parsed.tzinfo else parsed.replace(tzinfo=tz)).astimezone(UTC)
            duration = int(entry.get("duration") or 15)
            slots.append(
                RawSlot(
                    starts_at=starts_at,
                    ends_at=starts_at + timedelta(minutes=duration),
                    capacity=int(entry.get("free") or entry.get("capacity") or 1),
                    provider_ref=str(entry.get("id")) if entry.get("id") else None,
                )
            )
        return sorted(slots, key=lambda s: s.starts_at)

    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        if office.booking_url:
            params = {"serviceid": service.external_id, "date": slot.starts_at.date().isoformat()}
            separator = "&" if "?" in office.booking_url else "?"
            return f"{office.booking_url}{separator}{urlencode(params)}"
        return office.base_url
