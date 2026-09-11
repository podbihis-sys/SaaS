from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import AuthorityType, Provider, ServiceCategory, SlotStatus
from app.schemas.common import ORMModel


class ServiceOut(ORMModel):
    id: uuid.UUID
    office_id: uuid.UUID
    name: str
    category: ServiceCategory
    duration_minutes: int | None = None
    notes: str | None = None


class OfficeOut(ORMModel):
    id: uuid.UUID
    provider: Provider
    name: str
    authority_type: AuthorityType
    street: str | None = None
    postal_code: str | None = None
    city: str
    state: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    timezone: str
    booking_url: str | None = None
    phone: str | None = None
    #: False when the booking system may not be polled; the office is still
    #: listed so the user can book directly with the authority.
    scan_enabled: bool = True
    scan_blocked_reason: str | None = None
    services: list[ServiceOut] = Field(default_factory=list)
    #: Straight-line kilometres from the query point, when one was given.
    distance_km: float | None = None


class SlotOut(ORMModel):
    id: uuid.UUID
    office_id: uuid.UUID
    service_id: uuid.UUID
    starts_at: datetime
    ends_at: datetime | None = None
    capacity: int
    status: SlotStatus
    first_seen_at: datetime
    last_seen_at: datetime


class SlotWithContext(SlotOut):
    """A slot plus the labels the app needs to render it without extra calls."""

    office_name: str
    city: str
    service_name: str
    category: ServiceCategory
    timezone: str


class CategoryOut(BaseModel):
    value: ServiceCategory
    label_de: str
    #: How many offices in the catalogue currently offer this errand.
    office_count: int
