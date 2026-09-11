from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db_types import GUID, UTCDateTime
from app.models.base import Base, TimestampMixin, primary_key
from app.models.enums import BookingStatus, NotificationStatus


class Notification(Base, TimestampMixin):
    """One alert about one slot for one watch.

    The unique constraint is the dedupe mechanism: a slot that flickers in and
    out of availability must not produce a push every time it reappears.
    """

    __tablename__ = "notifications"
    __table_args__ = (UniqueConstraint("watch_id", "slot_id", name="uq_notifications_watch_slot"),)

    id: Mapped[uuid.UUID] = primary_key()
    watch_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("watches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    slot_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("slots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    status: Mapped[NotificationStatus] = mapped_column(
        String(16), nullable=False, default=NotificationStatus.PENDING, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(String(500), nullable=False)

    sent_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    read_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    error: Mapped[str | None] = mapped_column(String(500))


class BookingIntent(Base, TimestampMixin):
    """Record that we sent a user off to an official portal to book a slot.

    The app never books on the user's behalf — see docs/legal.md — so this is
    a handoff receipt, plus whatever the user tells us happened afterwards.
    """

    __tablename__ = "booking_intents"

    id: Mapped[uuid.UUID] = primary_key()
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    slot_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("slots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    watch_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), ForeignKey("watches.id", ondelete="SET NULL"))

    status: Mapped[BookingStatus] = mapped_column(
        String(16), nullable=False, default=BookingStatus.HANDED_OFF, index=True
    )
    #: Deep link handed to the user, with the slot preselected where possible.
    handoff_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    note: Mapped[str | None] = mapped_column(String(500))
