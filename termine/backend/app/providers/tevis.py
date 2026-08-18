from __future__ import annotations

from datetime import date, timedelta
from urllib.parse import urlencode, urljoin

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
from app.providers.html_utils import extract_bookable_dates, extract_time_slots
from app.providers.taxonomy import classify_service

log = get_logger(__name__)


class TevisProvider(AppointmentProvider):
    """TEVIS, the booking system used across much of NRW and Hesse.

    A TEVIS instance walks the user through four steps:

    1. ``/select2?md=<mandant>`` — pick the services and how many of each
    2. ``/location`` — pick a branch (skipped when the mandant has only one)
    3. ``/suggest`` — a month calendar of days with availability
    4. ``/suggest?date=YYYY-MM-DD`` — the times on one day

    The adapter jumps straight to steps 3 and 4, carrying the service selection
    in the query string, because TEVIS keeps that selection in the URL rather
    than in server-side session state.
    """

    key = Provider.TEVIS
    display_name = "TEVIS"
    min_request_interval = 4.0
    min_scan_interval_seconds = 300
    supports_discovery = True

    def _mandant(self, office: OfficeRef) -> str:
        mandant = office.meta.get("mandant") or office.external_id
        return str(mandant)

    def _selection_params(self, office: OfficeRef, service: ServiceRef) -> dict[str, str]:
        params = {
            "mdt": self._mandant(office),
            "select_cnc": "1",
            f"cnc-{service.external_id}": "1",
        }
        if location := office.meta.get("location_id"):
            params["loc"] = str(location)
        return params

    async def discover_services(self, client: httpx.AsyncClient, office: OfficeRef) -> list[RawService]:
        url = urljoin(office.base_url, "/select2") + "?" + urlencode({"md": self._mandant(office)})
        await self.throttle(url)
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"TEVIS service listing failed: {exc}") from exc

        tree = HTMLParser(response.text)
        services: list[RawService] = []
        seen: set[str] = set()
        # Every service is a numeric-quantity input named `cnc-<id>`, labelled
        # by the surrounding row.
        for node in tree.css("input[name^='cnc-'], select[name^='cnc-']"):
            name_attr = node.attributes.get("name") or ""
            external_id = name_attr.removeprefix("cnc-")
            if not external_id or external_id in seen:
                continue
            seen.add(external_id)
            label = self._label_for(tree, node, external_id)
            if not label:
                continue
            services.append(
                RawService(
                    external_id=external_id,
                    name=label,
                    category=classify_service(label),
                )
            )
        return services

    def _label_for(self, tree: HTMLParser, node: object, external_id: str) -> str | None:
        for label in tree.css("label"):
            if (label.attributes.get("for") or "").endswith(external_id):
                text = (label.text() or "").strip()
                if text:
                    return text
        current = getattr(node, "parent", None)
        for _ in range(3):
            if current is None:
                break
            text = (current.text() or "").strip()
            if 3 < len(text) < 200:
                return text
            current = current.parent
        return None

    async def fetch_slots(
        self,
        client: httpx.AsyncClient,
        office: OfficeRef,
        service: ServiceRef,
        date_from: date,
        date_to: date,
    ) -> list[RawSlot]:
        base_params = self._selection_params(office, service)
        calendar_url = urljoin(office.base_url, "/suggest") + "?" + urlencode(base_params)
        await self.throttle(calendar_url)
        try:
            response = await client.get(calendar_url)
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"TEVIS calendar request failed: {exc}") from exc

        if "suggest" not in response.text and "cnc" not in response.text:
            raise ProviderError("TEVIS calendar page had no recognisable structure")

        days = [
            day
            for day in extract_bookable_dates(response.text, class_hints=("nat_calendar_active", "buchbar", "available"))
            if date_from <= day <= date_to
        ]
        # A TEVIS calendar shows one month at a time; walk forward when the
        # requested window reaches past it.
        days = days[:31]

        slots: list[RawSlot] = []
        for day in days:
            day_params = {**base_params, "date": day.isoformat()}
            day_url = urljoin(office.base_url, "/suggest") + "?" + urlencode(day_params)
            await self.throttle(day_url)
            try:
                day_response = await client.get(day_url)
                day_response.raise_for_status()
            except httpx.HTTPError as exc:
                log.warning("tevis.day_fetch_failed", url=day_url, error=str(exc))
                continue
            slots.extend(
                extract_time_slots(
                    day_response.text,
                    day,
                    office.timezone,
                    base_url=office.base_url,
                    href_must_contain="suggest",
                )
            )
        return sorted(slots, key=lambda s: s.starts_at)

    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        if slot.provider_ref:
            return slot.provider_ref
        local_day = (slot.starts_at + timedelta(hours=1)).date()
        params = {**self._selection_params(office, service), "date": local_day.isoformat()}
        return urljoin(office.base_url, "/suggest") + "?" + urlencode(params)
