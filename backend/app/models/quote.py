from __future__ import annotations

import enum
import uuid
from decimal import Decimal

from sqlalchemy import Boolean, Enum, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID
from app.models.base import Base, TenantMixin, TimestampMixin, primary_key


class QuoteStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Quote(Base, TimestampMixin, TenantMixin):
    __tablename__ = "quotes"
    __table_args__ = (
        Index("ix_quotes_company_created", "company_id", "created_at"),
        Index("ix_quotes_company_status", "company_id", "status"),
    )

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inquiry_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("inquiries.id", ondelete="SET NULL"), nullable=True, index=True
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    number: Mapped[str] = mapped_column(String(40), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[QuoteStatus] = mapped_column(
        Enum(QuoteStatus, name="quote_status"),
        default=QuoteStatus.DRAFT,
        nullable=False,
    )
    currency: Mapped[str] = mapped_column(String(3), default="EUR", nullable=False)
    vat_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    vat_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"), nullable=False)
    needs_pricing: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    positions: Mapped[list["QuotePosition"]] = relationship(  # noqa: F821
        back_populates="quote", cascade="all, delete-orphan", order_by="QuotePosition.position"
    )
