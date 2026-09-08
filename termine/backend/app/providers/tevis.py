from __future__ import annotations

import re
from datetime import UTC, date, datetime, time, timedelta
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


class TevisProvider(AppointmentProvider):
    """TEVIS, the system behind most municipal appointment booking in Germany.

    An instance walks the user through six steps; the first four are ours:

    1. ``/select2?md=<mandant>`` — pick the services and how many of each
    2. ``/location?mdt=…&cnc-<service>=1`` — the branches, with addresses
    3. ``POST`` that same URL with ``loc=<branch>`` — fixes the branch
    4. the suggestions page — every free appointment as a small form

    The flow has to be walked in that order because TEVIS keeps the booking in
    a server-side session. Requesting the calendar directly with the selection
    as query parameters — which this adapter did until it was first run against
    a live instance — answers "Kein gültiger Standort gefunden" no matter how
    correct the parameters are.

    Two details cost an afternoon each. The mandant in the public URL
    (``md=27``) is not the id the flow uses (``mdt=415``); the real one is a
    hidden field on the entry page. And the suggestions page returns a bounded
    list rather than a calendar, so a longer horizon is covered by re-filtering
    from the last day it returned.
    """

    key = Provider.TEVIS
    display_name = "TEVIS"
    min_request_interval = 4.0
    min_scan_interval_seconds = 300
    supports_discovery = True

    def _mandant(self, office: OfficeRef) -> str:
        mandant = office.meta.get("mandant") or office.external_id
        return str(mandant)

    def _endpoint(self, office: OfficeRef, path: str) -> str:
        """Join a TEVIS path onto the instance URL, honouring any path prefix.

        Instances are not always mounted at the root: Bremen serves its at
        ``https://termin.bremen.de/termine/``. ``urljoin`` with a leading slash
        would silently drop that prefix and request ``/select2``, so the base
        is normalised to end in a slash and the path joined relatively.
        """
        base = office.base_url if office.base_url.endswith("/") else office.base_url + "/"
        return urljoin(base, path.lstrip("/"))

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
        url = self._endpoint(office, "select2") + "?" + urlencode({"md": self._mandant(office)})
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

    async def _open_flow(
        self, client: httpx.AsyncClient, office: OfficeRef, service: ServiceRef
    ) -> tuple[str, dict[str, str]]:
        """Walk the flow up to the suggestions page and return it.

        TEVIS keeps the booking in server-side session state, not in the URL:
        requesting ``/suggest`` with the selection as query parameters answers
        "Kein gültiger Standort gefunden" however correct the parameters are.
        The three steps below are what the browser does, and each one matters.

        The mandant is the subtle part. ``/select2?md=27`` is the public
        selector, but the form on that page submits a *different*, internal id
        (``mdt=415``). Sending the public one silently yields an empty flow.
        """
        entry = self._endpoint(office, "select2") + "?" + urlencode({"md": self._mandant(office)})
        await self.throttle(entry)
        try:
            first = await client.get(entry, follow_redirects=True)
            first.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"TEVIS entry page failed: {exc}") from exc

        tree = HTMLParser(first.text)
        internal = self._hidden_value(tree, "mdt") or self._mandant(office)

        selection = {
            "mdt": internal,
            "select_cnc": "1",
            f"cnc-{service.external_id}": "1",
        }
        location_url = self._endpoint(office, "location") + "?" + urlencode(selection)
        await self.throttle(location_url)
        try:
            locations = await client.get(location_url, follow_redirects=True)
            locations.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"TEVIS location page failed: {exc}") from exc

        if "personaldata" in str(locations.url):
            # Some mandants are configured to collect name, address and
            # telephone number *before* showing any appointment. There is no
            # availability to read there, and filling the form in would be
            # starting a booking on someone's behalf — so this office is
            # link-only, and says so instead of failing obscurely.
            raise ProviderError(
                "TEVIS-Mandant verlangt persönliche Daten vor der Terminanzeige — nicht abfragbar"
            )

        location_tree = HTMLParser(locations.text)
        wanted = office.meta.get("location_id")
        location_id = str(wanted) if wanted else self._hidden_value(location_tree, "loc")
        if not location_id:
            # A mandant with a single branch skips the step entirely and
            # answers with the suggestions right away.
            if self._is_suggestion_page(locations.text):
                return locations.text, selection
            raise ProviderError("TEVIS location page listed no branch")

        await self.throttle(location_url)
        try:
            suggestions = await client.post(
                location_url,
                data={"loc": location_id, "gps_lat": "", "gps_long": "", "select_location": "Weiter"},
                follow_redirects=True,
            )
            suggestions.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderError(f"TEVIS suggestion page failed: {exc}") from exc

        return suggestions.text, selection

    @staticmethod
    def _is_suggestion_page(page: str) -> bool:
        return "suggest_filter_form" in page or "suggestion_form" in page

    @staticmethod
    def _hidden_value(tree: HTMLParser, name: str) -> str | None:
        for node in tree.css(f'input[name="{name}"]'):
            value = (node.attributes.get("value") or "").strip()
            if value:
                return value
        return None

    def _filter_params(self, page: str, date_from: date, date_to: date) -> dict[str, str]:
        """The suggestion filter, rebuilt from the page's own form.

        The window is set with the same fields the page's filter uses, so the
        instance decides what they mean rather than the adapter guessing. The
        hidden fields are copied verbatim — one of them carries ``mdt=0``,
        which looks wrong and is exactly what the server expects here.
        """
        tree = HTMLParser(page)
        form = tree.css_first("form#suggest_filter_form")
        params: dict[str, str] = {}
        if form is not None:
            for node in form.css("input[type='hidden'][name]"):
                name = node.attributes.get("name") or ""
                if name and not name.startswith("filter_"):
                    params[name] = node.attributes.get("value") or ""
        params["filter_date_from"] = date_from.strftime("%d.%m.%Y")
        params["filter_date_to"] = date_to.strftime("%d.%m.%Y")
        return params

    def parse_suggestions(self, page: str, timezone: str) -> list[RawSlot]:
        """Every free appointment on a suggestions page.

        Each one is a small form carrying the date as ``YYYYMMDD`` and the
        start as minutes since midnight, with the visible time on its button.
        The minutes are authoritative; the button text is the fallback for an
        instance that renders it differently.
        """
        tree = HTMLParser(page)
        zone = ZoneInfo(timezone)
        slots: list[RawSlot] = []
        for form in tree.css("form.suggestion_form"):
            fields = {
                (node.attributes.get("name") or ""): (node.attributes.get("value") or "")
                for node in form.css("input[name]")
            }
            raw_date = fields.get("date", "")
            if not re.fullmatch(r"\d{8}", raw_date):
                continue
            day = date(int(raw_date[:4]), int(raw_date[4:6]), int(raw_date[6:8]))

            start = self._minutes(fields.get("start"))
            if start is None:
                button = form.css_first("button")
                match = re.search(r"(\d{1,2}):(\d{2})", (button.text() if button else "") or "")
                if not match:
                    continue
                start = int(match.group(1)) * 60 + int(match.group(2))
            end = self._minutes(fields.get("end"))

            starts_at = datetime.combine(day, time(0, 0), tzinfo=zone) + timedelta(minutes=start)
            ends_at = (
                datetime.combine(day, time(0, 0), tzinfo=zone) + timedelta(minutes=end)
                if end is not None and end > start
                else None
            )
            slots.append(
                RawSlot(
                    starts_at=starts_at.astimezone(UTC),
                    ends_at=ends_at.astimezone(UTC) if ends_at else None,
                )
            )
        return slots

    @staticmethod
    def _minutes(value: str | None) -> int | None:
        if value and value.isdigit():
            return int(value)
        return None

    async def fetch_slots(
        self,
        client: httpx.AsyncClient,
        office: OfficeRef,
        service: ServiceRef,
        date_from: date,
        date_to: date,
    ) -> list[RawSlot]:
        page, _ = await self._open_flow(client, office, service)

        if not self._is_suggestion_page(page):
            # Not the suggestions step at all — an error page, a redesign, or a
            # session that was refused. Never report this as "nothing free".
            raise ProviderError("TEVIS suggestion page had no recognisable structure")

        found: dict[datetime, RawSlot] = {}
        cursor = date_from
        suggest_url = self._endpoint(office, "suggest")
        # The instance answers with a bounded list, so the window is walked
        # forward from the last day it returned. Three requests is enough for a
        # 90-day horizon in practice and bounds the cost when it is not.
        for attempt in range(3):
            if attempt:
                params = self._filter_params(page, cursor, date_to)
                await self.throttle(suggest_url)
                try:
                    response = await client.get(suggest_url, params=params, follow_redirects=True)
                    response.raise_for_status()
                except httpx.HTTPError as exc:
                    log.warning("tevis.window_fetch_failed", url=suggest_url, error=str(exc))
                    break
                page = response.text

            batch = [
                s for s in self.parse_suggestions(page, office.timezone) if s.starts_at.date() <= date_to
            ]
            fresh = [s for s in batch if s.starts_at not in found]
            for slot in fresh:
                found[slot.starts_at] = slot
            if not fresh:
                break
            last = max(s.starts_at.date() for s in batch)
            if last >= date_to:
                break
            cursor = last + timedelta(days=1)

        return sorted(found.values(), key=lambda s: s.starts_at)

    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        """Where to send the user.

        Not the slot itself: TEVIS holds the booking in a session that belongs
        to whoever started it, so a link into ours would be meaningless (and
        would hold a slot the user has not asked for). The handoff opens the
        office's own flow at the service selection, two clicks from the time.
        """
        return self._endpoint(office, "select2") + "?" + urlencode({"md": self._mandant(office)})
