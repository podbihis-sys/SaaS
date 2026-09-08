from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID, JSONType, UTCDateTime
from app.models.base import Base, TimestampMixin, primary_key
from app.models.enums import AuthorityType, Provider, ServiceCategory

if TYPE_CHECKING:
    from app.models.slot import Slot


class Office(Base, TimestampMixin):
    """A physical place you can get an appointment at, e.g. 'Bürgeramt Kreuzberg'."""

    __tablename__ = "offices"
    __table_args__ = (
        UniqueConstraint("provider", "external_id", name="uq_offices_provider_external_id"),
    )

    id: Mapped[uuid.UUID] = primary_key()

    provider: Mapped[Provider] = mapped_column(String(32), nullable=False, index=True)
    #: Identifier this office carries inside its own booking system.
    external_id: Mapped[str] = mapped_column(String(128), nullable=False)
    #: Base URL of the booking system instance. One provider serves many cities,
    #: each on its own host, so the adapter needs this per office.
    base_url: Mapped[str] = mapped_column(String(512), nullable=False)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    authority_type: Mapped[AuthorityType] = mapped_column(
        String(32), nullable=False, default=AuthorityType.BUERGERAMT, index=True
    )

    street: Mapped[str | None] = mapped_column(String(200))
    postal_code: Mapped[str | None] = mapped_column(String(10), index=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    state: Mapped[str | None] = mapped_column(String(64))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    #: Amtlicher Gemeindeschlüssel of the Gemeinde this office sits in. Filled
    #: by the seeder from the official register; it is what lets a postcode
    #: or town name land on the offices responsible for it.
    municipality_ags: Mapped[str | None] = mapped_column(String(8), index=True)

    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Europe/Berlin")
    #: Public page a user lands on to actually book.
    booking_url: Mapped[str | None] = mapped_column(String(512))
    phone: Mapped[str | None] = mapped_column(String(64))

    #: Whether the office appears in the app at all.
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    #: Whether the scanner may poll it. Separate from `active` because the two
    #: are genuinely different permissions: Bremen's offices are worth listing
    #: so a user can find the right one and tap through to the official portal,
    #: but its booking system publishes `Disallow: /`, so polling it is not
    #: ours to do. Listed, not scanned.
    scan_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    #: Why scanning is off, shown in the app and in the catalogue docs.
    scan_blocked_reason: Mapped[str | None] = mapped_column(String(300))

    #: Rolling scanner health, used to back off from offices that keep failing.
    last_scanned_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    consecutive_failures: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cooldown_until: Mapped[datetime | None] = mapped_column(UTCDateTime())
    #: Free-form adapter state (session cookies hints, form ids, etc.).
    provider_meta: Mapped[dict | None] = mapped_column(JSONType())

    services: Mapped[list[Service]] = relationship(
        back_populates="office", cascade="all, delete-orphan", lazy="selectin"
    )
    slots: Mapped[list[Slot]] = relationship(back_populates="office", cascade="all, delete-orphan")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Office {self.city}/{self.name} ({self.provider})>"


class Service(Base, TimestampMixin):
    """One bookable errand at one office, e.g. 'Personalausweis beantragen'."""

    __tablename__ = "services"
    __table_args__ = (
        UniqueConstraint("office_id", "external_id", name="uq_services_office_external_id"),
    )

    id: Mapped[uuid.UUID] = primary_key()
    office_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("offices.id", ondelete="CASCADE"), nullable=False, index=True
    )

    external_id: Mapped[str] = mapped_column(String(128), nullable=False)
    #: Verbatim label from the authority, shown to the user alongside the category.
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    category: Mapped[ServiceCategory] = mapped_column(
        String(40), nullable=False, default=ServiceCategory.SONSTIGES, index=True
    )
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    #: Some services require you to bring documents; surfaced in the app.
    notes: Mapped[str | None] = mapped_column(String(1000))
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    #: Scan bookkeeping lives here rather than on Office because an office/service
    #: pair is the unit that gets polled, and one office can carry twenty services.
    last_scanned_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    next_scan_at: Mapped[datetime | None] = mapped_column(UTCDateTime(), index=True)
    consecutive_failures: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    office: Mapped[Office] = relationship(back_populates="services")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Service {self.name} ({self.category})>"
