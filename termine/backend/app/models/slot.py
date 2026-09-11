from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID, UTCDateTime
from app.models.base import Base, TimestampMixin, primary_key, utcnow
from app.models.enums import SlotStatus

if TYPE_CHECKING:
    from app.models.office import Office, Service


class Slot(Base, TimestampMixin):
    """A concrete free appointment observed at an office.

    Rows are never deleted when a slot disappears: they are marked ``gone`` so
    the app can show "war frei um 14:03" history and so the notifier can tell a
    genuinely new slot from one that flickered.
    """

    __tablename__ = "slots"
    __table_args__ = (
        UniqueConstraint("office_id", "service_id", "starts_at", name="uq_slots_office_service_start"),
        Index("ix_slots_status_starts_at", "status", "starts_at"),
        Index("ix_slots_first_seen_at", "first_seen_at"),
    )

    id: Mapped[uuid.UUID] = primary_key()

    office_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("offices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    service_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True
    )

    #: Always stored in UTC; the office timezone lives on Office.
    starts_at: Mapped[datetime] = mapped_column(UTCDateTime(), nullable=False, index=True)
    ends_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    #: Some systems expose how many people can still take this exact time.
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    status: Mapped[SlotStatus] = mapped_column(
        String(16), nullable=False, default=SlotStatus.AVAILABLE, index=True
    )

    first_seen_at: Mapped[datetime] = mapped_column(UTCDateTime(), nullable=False, default=utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(UTCDateTime(), nullable=False, default=utcnow)
    gone_at: Mapped[datetime | None] = mapped_column(UTCDateTime())

    #: Opaque token the booking system needs to select this slot again.
    provider_ref: Mapped[str | None] = mapped_column(String(512))

    office: Mapped[Office] = relationship(back_populates="slots")
    service: Mapped[Service] = relationship()

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Slot {self.starts_at.isoformat()} {self.status}>"


class ScanRun(Base):
    """One poll of one office/service pair. Kept for observability and backoff."""

    __tablename__ = "scan_runs"
    __table_args__ = (Index("ix_scan_runs_office_started", "office_id", "started_at"),)

    id: Mapped[uuid.UUID] = primary_key()
    office_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("offices.id", ondelete="CASCADE"), nullable=False
    )
    service_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("services.id", ondelete="CASCADE")
    )
    provider: Mapped[str] = mapped_column(String(32), nullable=False)

    started_at: Mapped[datetime] = mapped_column(UTCDateTime(), nullable=False, default=utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="ok")

    slots_seen: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    slots_new: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    slots_gone: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    error: Mapped[str | None] = mapped_column(String(1000))
