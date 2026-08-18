from __future__ import annotations

import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import BookingStatus, NotificationStatus, ServiceCategory
from app.models.watch import ALL_WEEKDAYS
from app.schemas.catalog import SlotWithContext
from app.schemas.common import ORMModel


class WatchCreate(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    category: ServiceCategory
    office_ids: list[uuid.UUID] = Field(min_length=1, max_length=25)

    earliest_date: date | None = None
    latest_date: date | None = None
    weekday_mask: int = Field(default=ALL_WEEKDAYS, ge=1, le=ALL_WEEKDAYS)
    earliest_time: time | None = None
    latest_time: time | None = None
    min_lead_hours: int = Field(default=2, ge=0, le=720)

    quiet_hours_start: time | None = None
    quiet_hours_end: time | None = None
    expires_at: datetime | None = None

    @field_validator("label")
    @classmethod
    def _strip_label(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def _check_ranges(self) -> WatchCreate:
        if self.earliest_date and self.latest_date and self.earliest_date > self.latest_date:
            raise ValueError("earliest_date must not be after latest_date")
        if self.earliest_time and self.latest_time and self.earliest_time > self.latest_time:
            raise ValueError("earliest_time must not be after latest_time")
        if (self.quiet_hours_start is None) != (self.quiet_hours_end is None):
            raise ValueError("quiet_hours_start and quiet_hours_end must be set together")
        return self


class WatchUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=120)
    office_ids: list[uuid.UUID] | None = Field(default=None, min_length=1, max_length=25)
    earliest_date: date | None = None
    latest_date: date | None = None
    weekday_mask: int | None = Field(default=None, ge=1, le=ALL_WEEKDAYS)
    earliest_time: time | None = None
    latest_time: time | None = None
    min_lead_hours: int | None = Field(default=None, ge=0, le=720)
    active: bool | None = None
    paused_until: datetime | None = None
    quiet_hours_start: time | None = None
    quiet_hours_end: time | None = None
    expires_at: datetime | None = None


class WatchOfficeOut(ORMModel):
    id: uuid.UUID
    name: str
    city: str


class WatchOut(ORMModel):
    id: uuid.UUID
    label: str
    category: ServiceCategory
    offices: list[WatchOfficeOut]
    earliest_date: date | None
    latest_date: date | None
    weekday_mask: int
    earliest_time: time | None
    latest_time: time | None
    min_lead_hours: int
    active: bool
    paused_until: datetime | None
    quiet_hours_start: time | None
    quiet_hours_end: time | None
    expires_at: datetime | None
    last_notified_at: datetime | None
    notification_count: int
    created_at: datetime


class WatchDetail(WatchOut):
    """A watch plus what is bookable right now, which is what the app opens on."""

    matching_slots: list[SlotWithContext] = Field(default_factory=list)


class NotificationOut(ORMModel):
    id: uuid.UUID
    watch_id: uuid.UUID
    slot_id: uuid.UUID
    status: NotificationStatus
    title: str
    body: str
    sent_at: datetime | None
    read_at: datetime | None
    created_at: datetime


class DeviceRegister(BaseModel):
    push_token: str = Field(min_length=8, max_length=256)
    platform: str
    locale: str = "de"
    app_version: str | None = None


class DeviceOut(ORMModel):
    id: uuid.UUID
    platform: str
    locale: str
    active: bool
    created_at: datetime


class AuthRequest(BaseModel):
    #: Random id the app generates once and keeps in secure storage.
    install_id: str = Field(min_length=8, max_length=64)
    locale: str = "de"


class AuthResponse(BaseModel):
    token: str
    expires_at: datetime
    user_id: uuid.UUID


class BookingCreate(BaseModel):
    slot_id: uuid.UUID
    watch_id: uuid.UUID | None = None


class BookingOut(ORMModel):
    id: uuid.UUID
    slot_id: uuid.UUID
    watch_id: uuid.UUID | None
    status: BookingStatus
    handoff_url: str
    created_at: datetime
    resolved_at: datetime | None
    note: str | None


class BookingResolve(BaseModel):
    status: BookingStatus
    note: str | None = Field(default=None, max_length=500)
