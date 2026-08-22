from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Table,
    Time,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID, UTCDateTime
from app.models.base import Base, TimestampMixin, primary_key
from app.models.enums import ServiceCategory

if TYPE_CHECKING:
    from app.models.office import Office
    from app.models.user import User

#: A watch can cover several offices — "any Bürgeramt in Berlin" is the whole
#: point, since which branch you visit rarely matters.
watch_offices = Table(
    "watch_offices",
    Base.metadata,
    Column("watch_id", GUID(), ForeignKey("watches.id", ondelete="CASCADE"), primary_key=True),
    Column("office_id", GUID(), ForeignKey("offices.id", ondelete="CASCADE"), primary_key=True),
)

#: Monday .. Sunday as bit 0 .. bit 6.
ALL_WEEKDAYS = 0b1111111


class Watch(Base, TimestampMixin):
    """A standing search order: "tell me when this errand is bookable"."""

    __tablename__ = "watches"

    id: Mapped[uuid.UUID] = primary_key()
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    label: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[ServiceCategory] = mapped_column(String(40), nullable=False, index=True)

    # --- when would you actually go? -------------------------------------
    earliest_date: Mapped[date | None] = mapped_column(Date)
    latest_date: Mapped[date | None] = mapped_column(Date)
    #: Bitmask over weekdays; 0b1111111 means "any day".
    weekday_mask: Mapped[int] = mapped_column(Integer, nullable=False, default=ALL_WEEKDAYS)
    #: Local office time, not UTC — "after 9am" means 9am where the office is.
    earliest_time: Mapped[time | None] = mapped_column(Time)
    latest_time: Mapped[time | None] = mapped_column(Time)
    #: Ignore slots that start sooner than this; you cannot teleport.
    min_lead_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=2)

    # --- how often should we bother you? ----------------------------------
    #: Cap on alerts per calendar day, in the office's local time. None means
    #: only the deployment-wide burst guard applies.
    daily_alert_limit: Mapped[int | None] = mapped_column(Integer)
    #: Retire the watch once this many alerts have gone out. Someone who needs
    #: one Personalausweis appointment wants the app to stop on its own; having
    #: to delete the watch by hand is how push permission gets revoked.
    auto_stop_after: Mapped[int | None] = mapped_column(Integer)

    # --- how should we bother you? ---------------------------------------
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    paused_until: Mapped[datetime | None] = mapped_column(UTCDateTime())
    #: Suppress pushes during these local hours (e.g. 22:00 -> 07:00).
    quiet_hours_start: Mapped[time | None] = mapped_column(Time)
    quiet_hours_end: Mapped[time | None] = mapped_column(Time)
    #: Stop watching once the user has booked something.
    expires_at: Mapped[datetime | None] = mapped_column(UTCDateTime())

    last_notified_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    notification_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user: Mapped[User] = relationship(back_populates="watches")
    offices: Mapped[list[Office]] = relationship(secondary=watch_offices, lazy="selectin")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Watch {self.label} ({self.category})>"
