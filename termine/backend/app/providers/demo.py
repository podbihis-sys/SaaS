from __future__ import annotations

import hashlib
from datetime import UTC, date, datetime, time, timedelta

import httpx

from app.models.enums import Provider, ServiceCategory
from app.providers.base import (
    AppointmentProvider,
    OfficeRef,
    RawService,
    RawSlot,
    ServiceRef,
)

#: How long one synthetic availability pattern holds before it is reshuffled.
#: Short enough that a developer sees slots appear and vanish while the app is
#: open, which is the only way to exercise the notification path locally.
_EPOCH_MINUTES = 5

_DEMO_SERVICES: list[RawService] = [
    RawService("demo-anmeldung", "Anmeldung einer Wohnung", ServiceCategory.ANMELDUNG, 15),
    RawService("demo-perso", "Personalausweis beantragen", ServiceCategory.PERSONALAUSWEIS, 20),
    RawService("demo-pass", "Reisepass beantragen", ServiceCategory.REISEPASS, 20),
    RawService("demo-fz", "Führungszeugnis beantragen", ServiceCategory.FUEHRUNGSZEUGNIS, 10),
    RawService("demo-kfz", "Fahrzeug zulassen", ServiceCategory.KFZ_ZULASSUNG, 30),
]


class DemoProvider(AppointmentProvider):
    """A booking system that only exists on this machine.

    Generates a stable-but-changing availability pattern from a hash, so the
    scanner, matcher and notifier can be run end to end without sending a
    single request to a real authority. This is the default provider in dev
    and the only provider enabled in CI.
    """

    key = Provider.DEMO
    display_name = "Demo (synthetisch)"
    min_request_interval = 0.0
    min_scan_interval_seconds = 30
    supports_discovery = False

    async def discover_services(self, client: httpx.AsyncClient, office: OfficeRef) -> list[RawService]:
        return list(_DEMO_SERVICES)

    async def fetch_slots(
        self,
        client: httpx.AsyncClient,
        office: OfficeRef,
        service: ServiceRef,
        date_from: date,
        date_to: date,
    ) -> list[RawSlot]:
        epoch = int(datetime.now(UTC).timestamp() // (_EPOCH_MINUTES * 60))
        slots: list[RawSlot] = []
        day = date_from
        while day <= date_to:
            if day.weekday() < 5:  # Ämter do not open on weekends
                slots.extend(self._slots_for_day(office, service, day, epoch))
            day += timedelta(days=1)
        return slots

    def _slots_for_day(
        self, office: OfficeRef, service: ServiceRef, day: date, epoch: int
    ) -> list[RawSlot]:
        seed = f"{office.external_id}|{service.external_id}|{day.isoformat()}|{epoch}"
        digest = hashlib.sha256(seed.encode()).digest()

        # Most days at a real Bürgeramt have nothing at all. Roughly one day in
        # five carries anything, which keeps the demo honest.
        if digest[0] % 5 != 0:
            return []

        count = 1 + digest[1] % 3
        slots: list[RawSlot] = []
        for i in range(count):
            hour = 8 + digest[2 + i] % 9  # 08:00 .. 16:00
            minute = (digest[5 + i] % 4) * 15
            # Office-local wall clock. Germany is UTC+1/+2; the demo pins UTC+2
            # rather than pulling in a tz database it does not otherwise need.
            starts_local = datetime.combine(day, time(hour, minute))
            starts_at = starts_local.replace(tzinfo=UTC) - timedelta(hours=2)
            slots.append(
                RawSlot(
                    starts_at=starts_at,
                    ends_at=starts_at + timedelta(minutes=15),
                    capacity=1,
                    provider_ref=f"demo:{day.isoformat()}:{hour:02d}{minute:02d}",
                )
            )
        return sorted(slots, key=lambda s: s.starts_at)

    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        return office.booking_url or f"https://example.invalid/demo/{office.external_id}"
