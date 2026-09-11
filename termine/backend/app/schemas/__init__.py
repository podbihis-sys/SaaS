from __future__ import annotations

from app.schemas.catalog import CategoryOut, OfficeOut, ServiceOut, SlotOut, SlotWithContext
from app.schemas.common import Ack, ErrorResponse, ORMModel, Page
from app.schemas.watch import (
    AuthRequest,
    AuthResponse,
    BookingCreate,
    BookingOut,
    BookingResolve,
    DeviceOut,
    DeviceRegister,
    NotificationOut,
    WatchCreate,
    WatchDetail,
    WatchOfficeOut,
    WatchOut,
    WatchUpdate,
)

__all__ = [
    "Ack",
    "AuthRequest",
    "AuthResponse",
    "BookingCreate",
    "BookingOut",
    "BookingResolve",
    "CategoryOut",
    "DeviceOut",
    "DeviceRegister",
    "ErrorResponse",
    "NotificationOut",
    "ORMModel",
    "OfficeOut",
    "Page",
    "ServiceOut",
    "SlotOut",
    "SlotWithContext",
    "WatchCreate",
    "WatchDetail",
    "WatchOfficeOut",
    "WatchOut",
    "WatchUpdate",
]
