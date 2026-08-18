from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID, UTCDateTime
from app.models.base import Base, TimestampMixin, primary_key
from app.models.enums import DevicePlatform

if TYPE_CHECKING:
    from app.models.watch import Watch


class User(Base, TimestampMixin):
    """An account.

    Deliberately anonymous by default: the app is useful without knowing who
    you are, so a fresh install creates a user keyed only on a random install
    id. An email address is optional and only used for fallback alerts.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = primary_key()
    #: Random opaque id generated on the device at first launch.
    install_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(320), unique=True, index=True)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="de")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(UTCDateTime())

    devices: Mapped[list[Device]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    watches: Mapped[list[Watch]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Device(Base, TimestampMixin):
    """A push target. One user can have a phone, a tablet and the web app."""

    __tablename__ = "devices"
    __table_args__ = (UniqueConstraint("push_token", name="uq_devices_push_token"),)

    id: Mapped[uuid.UUID] = primary_key()
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    #: Expo push token (`ExponentPushToken[...]`), valid for both APNs and FCM.
    push_token: Mapped[str] = mapped_column(String(256), nullable=False)
    platform: Mapped[DevicePlatform] = mapped_column(String(16), nullable=False)
    locale: Mapped[str] = mapped_column(String(8), nullable=False, default="de")
    app_version: Mapped[str | None] = mapped_column(String(32))

    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    #: Set when Expo tells us the token is dead (`DeviceNotRegistered`).
    invalidated_at: Mapped[datetime | None] = mapped_column(UTCDateTime())

    user: Mapped[User] = relationship(back_populates="devices")
