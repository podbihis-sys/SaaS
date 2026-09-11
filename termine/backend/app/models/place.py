from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db_types import UTCDateTime
from app.models.base import Base, primary_key, utcnow


class Municipality(Base):
    """One politically independent Gemeinde, as the official register lists it.

    Seeded from Destatis' GV100AD (see ``scripts/import_gv100ad.py``). The
    Amtlicher Gemeindeschlüssel is the primary key because every other German
    register — postcodes, districts, the authorities themselves — refers to a
    municipality by that key, never by name: 410 short names occur more than
    once ("Neuenkirchen" exists eight times).
    """

    __tablename__ = "municipalities"

    #: Amtlicher Gemeindeschlüssel, 8 digits: Land(2) RB(1) Kreis(2) Gemeinde(3).
    ags: Mapped[str] = mapped_column(String(8), primary_key=True)
    #: Name as registered, with title: "Kiel, Landeshauptstadt".
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    #: Name as people type it: "Kiel".
    short_name: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    #: Textkennzeichen of the register (61 kreisfreie Stadt, 64 kreisangehörig, ...).
    kind: Mapped[str] = mapped_column(String(2), nullable=False)
    population: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    area_ha: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    #: Postcode of the administrative seat. For a Gemeinde with one postcode
    #: (``plz_multi`` False) this is *the* postcode and resolves it exactly.
    plz: Mapped[str | None] = mapped_column(String(5), index=True)
    plz_multi: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    #: Kreis key (first five digits of the AGS) and what the register calls it.
    district_ags: Mapped[str] = mapped_column(String(5), nullable=False, index=True)
    district_name: Mapped[str] = mapped_column(String(80), nullable=False)
    district_seat: Mapped[str | None] = mapped_column(String(80))
    state_key: Mapped[str] = mapped_column(String(2), nullable=False)
    state: Mapped[str] = mapped_column(String(40), nullable=False)

    #: Gebietsstand of the extract this row came from, ISO date.
    register_stand: Mapped[str | None] = mapped_column(String(10))
    updated_at: Mapped[datetime] = mapped_column(
        UTCDateTime(), default=utcnow, onupdate=utcnow, nullable=False
    )

    @property
    def is_kreisfrei(self) -> bool:
        """Kreisfreie Städte and Stadtkreise handle every errand themselves."""
        return self.kind in ("61", "62")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Municipality {self.ags} {self.short_name}>"


class PostalCode(Base):
    """One postcode → locality → municipality mapping.

    A postcode is not a municipality: Berlin has 190 of them, and a rural
    postcode routinely covers half a dozen villages in two Gemeinden. Rows are
    seeded from the register (seat postcodes, exact where the Gemeinde has only
    one) and completed on first use from the OpenPLZ API, so a postcode is
    looked up externally at most once.
    """

    __tablename__ = "postal_codes"
    __table_args__ = (UniqueConstraint("plz", "ags", "locality", name="uq_postal_codes_plz_ags_locality"),)

    id: Mapped[uuid.UUID] = primary_key()
    plz: Mapped[str] = mapped_column(String(5), nullable=False, index=True)
    #: The place name the postcode belongs to; often but not always the Gemeinde.
    locality: Mapped[str] = mapped_column(String(80), nullable=False)
    ags: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    #: Where the row came from: "gv100ad" or "openplzapi".
    source: Mapped[str] = mapped_column(String(16), nullable=False)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False)


class PostalCodeLookup(Base):
    """Record that a postcode has been completed from the external source.

    The register alone knows a postcode only as the seat of *one* Gemeinde,
    while the same postcode may cover the neighbouring village in another. So
    every postcode is completed externally exactly once — hit or miss — and
    this row is what says it has been. A mistyped postcode therefore costs one
    request, not one per keystroke.
    """

    __tablename__ = "postal_code_lookups"

    plz: Mapped[str] = mapped_column(String(5), primary_key=True)
    #: How many mappings the external source returned; 0 is a miss.
    hits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    checked_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False)
