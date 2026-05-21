from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID
from app.models.base import Base, TimestampMixin, primary_key


class CompanySettings(Base, TimestampMixin):
    __tablename__ = "company_settings"

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("companies.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    vat_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), default=Decimal("0.19"), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR", nullable=False)
    quote_number_prefix: Mapped[str] = mapped_column(String(20), default="AN-", nullable=False)
    quote_number_counter: Mapped[int] = mapped_column(default=1, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    iban: Mapped[str | None] = mapped_column(String(40), nullable=True)
    bic: Mapped[str | None] = mapped_column(String(20), nullable=True)
    locale: Mapped[str] = mapped_column(String(10), default="de-DE", nullable=False)

    company: Mapped["Company"] = relationship(back_populates="settings")  # noqa: F821
