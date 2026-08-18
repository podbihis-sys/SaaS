from __future__ import annotations

import asyncio
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import date, datetime

import httpx

from app.config import settings
from app.models.enums import AuthorityType, Provider, ServiceCategory


@dataclass(frozen=True, slots=True)
class RawOffice:
    """An office as the booking system describes it, before it is persisted."""

    external_id: str
    name: str
    city: str
    base_url: str
    authority_type: AuthorityType = AuthorityType.BUERGERAMT
    street: str | None = None
    postal_code: str | None = None
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    booking_url: str | None = None
    phone: str | None = None
    meta: dict = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RawService:
    external_id: str
    name: str
    category: ServiceCategory = ServiceCategory.SONSTIGES
    duration_minutes: int | None = None
    notes: str | None = None


@dataclass(frozen=True, slots=True)
class RawSlot:
    """A free appointment. ``starts_at`` is always timezone-aware UTC."""

    starts_at: datetime
    ends_at: datetime | None = None
    capacity: int = 1
    provider_ref: str | None = None


class RateLimiter:
    """One in-flight request per host, spaced by a minimum interval.

    Public authority booking systems are small and easily overwhelmed. Being a
    polite client is not optional here — it is the difference between a tool
    that is tolerated and one that gets the whole IP range blocked.
    """

    def __init__(self) -> None:
        self._locks: dict[str, asyncio.Lock] = {}
        self._last_call: dict[str, float] = {}

    async def acquire(self, host: str, min_interval: float) -> None:
        lock = self._locks.setdefault(host, asyncio.Lock())
        await lock.acquire()
        try:
            elapsed = time.monotonic() - self._last_call.get(host, 0.0)
            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)
        finally:
            self._last_call[host] = time.monotonic()
            lock.release()


_rate_limiter = RateLimiter()


def build_client(**kwargs: object) -> httpx.AsyncClient:
    """HTTP client with an identifying User-Agent and a hard timeout."""
    headers = {
        "User-Agent": settings.HTTP_USER_AGENT,
        "Accept-Language": "de-DE,de;q=0.9",
    }
    headers.update(kwargs.pop("headers", {}) or {})  # type: ignore[arg-type]
    return httpx.AsyncClient(
        headers=headers,
        timeout=httpx.Timeout(settings.HTTP_TIMEOUT_SECONDS),
        follow_redirects=True,
        **kwargs,  # type: ignore[arg-type]
    )


class AppointmentProvider(ABC):
    """Adapter for one family of booking systems.

    Implementations are stateless; everything they need about a specific city
    arrives through ``base_url`` and the office's ``provider_meta``.
    """

    key: Provider
    display_name: str
    #: Politeness floor between two requests to the same host, in seconds.
    min_request_interval: float = 2.0
    #: Politeness floor between two *scans* of the same office/service pair.
    min_scan_interval_seconds: int = 300
    #: Whether ``discover_offices`` is implemented at all. Many systems only
    #: expose offices through a hand-maintained catalogue.
    supports_discovery: bool = False

    async def throttle(self, url: str) -> None:
        host = httpx.URL(url).host or "unknown"
        await _rate_limiter.acquire(host, self.min_request_interval)

    async def discover_offices(self, client: httpx.AsyncClient, base_url: str) -> list[RawOffice]:
        """List offices served by this booking system instance."""
        return []

    @abstractmethod
    async def discover_services(
        self, client: httpx.AsyncClient, office: OfficeRef
    ) -> list[RawService]:
        """List bookable services at one office."""

    @abstractmethod
    async def fetch_slots(
        self,
        client: httpx.AsyncClient,
        office: OfficeRef,
        service: ServiceRef,
        date_from: date,
        date_to: date,
    ) -> list[RawSlot]:
        """Return every free appointment in the window."""

    @abstractmethod
    def booking_url(self, office: OfficeRef, service: ServiceRef, slot: RawSlot) -> str:
        """Deep link that drops the user into the official booking flow.

        Adapters return the most specific URL the system supports — ideally with
        office, service and date preselected, otherwise the service landing page.
        """


@dataclass(frozen=True, slots=True)
class OfficeRef:
    """The subset of an ``Office`` an adapter is allowed to depend on."""

    external_id: str
    base_url: str
    name: str
    timezone: str = "Europe/Berlin"
    booking_url: str | None = None
    meta: dict = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class ServiceRef:
    external_id: str
    name: str
    category: ServiceCategory = ServiceCategory.SONSTIGES
