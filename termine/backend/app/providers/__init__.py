from __future__ import annotations

from app.config import settings
from app.core.errors import ProviderError
from app.models.enums import Provider
from app.models.office import Office, Service
from app.providers.base import (
    AppointmentProvider,
    OfficeRef,
    RawOffice,
    RawService,
    RawSlot,
    ServiceRef,
    build_client,
)
from app.providers.berlin_zms import BerlinZmsProvider
from app.providers.demo import DemoProvider
from app.providers.etermin import ETerminProvider
from app.providers.netappoint import NetAppointProvider
from app.providers.tevis import TevisProvider

_REGISTRY: dict[Provider, AppointmentProvider] = {
    p.key: p
    for p in (
        DemoProvider(),
        BerlinZmsProvider(),
        TevisProvider(),
        NetAppointProvider(),
        ETerminProvider(),
    )
}


def get_provider(key: Provider | str) -> AppointmentProvider:
    try:
        provider = _REGISTRY[Provider(key)]
    except (KeyError, ValueError) as exc:
        raise ProviderError(f"No adapter registered for provider {key!r}") from exc
    return provider


def is_enabled(key: Provider | str) -> bool:
    """Whether the deployment is configured to contact this booking system.

    Adapters exist for more systems than any single deployment should poll;
    ``SCANNER_PROVIDERS`` is the switch that decides which are live.
    """
    return str(key) in settings.enabled_providers


def all_providers() -> list[AppointmentProvider]:
    return list(_REGISTRY.values())


def office_ref(office: Office) -> OfficeRef:
    return OfficeRef(
        external_id=office.external_id,
        base_url=office.base_url,
        name=office.name,
        timezone=office.timezone,
        booking_url=office.booking_url,
        meta=office.provider_meta or {},
    )


def service_ref(service: Service) -> ServiceRef:
    return ServiceRef(
        external_id=service.external_id,
        name=service.name,
        category=service.category,
    )


__all__ = [
    "AppointmentProvider",
    "OfficeRef",
    "RawOffice",
    "RawService",
    "RawSlot",
    "ServiceRef",
    "all_providers",
    "build_client",
    "get_provider",
    "is_enabled",
    "office_ref",
    "service_ref",
]
