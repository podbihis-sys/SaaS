from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID
from app.models.base import Base, TenantMixin, TimestampMixin, primary_key


class InquiryStatus(str, enum.Enum):
    NEW = "new"
    AI_PENDING = "ai_pending"
    AI_DONE = "ai_done"
    QUOTED = "quoted"
    CLOSED = "closed"
    CANCELED = "canceled"


class Inquiry(Base, TimestampMixin, TenantMixin):
    __tablename__ = "inquiries"
    __table_args__ = (
        Index("ix_inquiries_company_created", "company_id", "created_at"),
        Index("ix_inquiries_company_status", "company_id", "status"),
    )

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[InquiryStatus] = mapped_column(
        Enum(InquiryStatus, name="inquiry_status"),
        default=InquiryStatus.NEW,
        nullable=False,
    )
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    address_line1: Mapped[str | None] = mapped_column(String(200), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)

    images: Mapped[list["InquiryImage"]] = relationship(  # noqa: F821
        back_populates="inquiry", cascade="all, delete-orphan"
    )
    analyses: Mapped[list["AIAnalysis"]] = relationship(  # noqa: F821
        back_populates="inquiry", cascade="all, delete-orphan"
    )
