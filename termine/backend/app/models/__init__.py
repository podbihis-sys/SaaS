from __future__ import annotations

from app.models.base import Base, TimestampMixin, utcnow
from app.models.enums import (
    AuthorityType,
    BookingStatus,
    DevicePlatform,
    NotificationStatus,
    Provider,
    ScanStatus,
    ServiceCategory,
    SlotStatus,
)
from app.models.notification import BookingIntent, Notification
from app.models.office import Office, Service
from app.models.place import Municipality, PostalCode, PostalCodeLookup
from app.models.slot import ScanRun, Slot
from app.models.user import Device, User
from app.models.watch import ALL_WEEKDAYS, Watch, watch_offices

__all__ = [
    "ALL_WEEKDAYS",
    "AuthorityType",
    "Base",
    "BookingIntent",
    "BookingStatus",
    "Device",
    "DevicePlatform",
    "Municipality",
    "Notification",
    "NotificationStatus",
    "Office",
    "PostalCode",
    "PostalCodeLookup",
    "Provider",
    "ScanRun",
    "ScanStatus",
    "Service",
    "ServiceCategory",
    "Slot",
    "SlotStatus",
    "TimestampMixin",
    "User",
    "Watch",
    "utcnow",
    "watch_offices",
]
