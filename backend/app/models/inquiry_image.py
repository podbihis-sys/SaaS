from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID
from app.models.base import Base, TenantMixin, TimestampMixin, primary_key


class InquiryImage(Base, TimestampMixin, TenantMixin):
    __tablename__ = "inquiry_images"

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    storage_path: Mapped[str] = mapped_column(String(600), nullable=False)
    public_url: Mapped[str | None] = mapped_column(String(800), nullable=True)
    content_type: Mapped[str] = mapped_column(String(80), default="image/jpeg", nullable=False)
    size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    inquiry: Mapped[Inquiry] = relationship(back_populates="images")  # noqa: F821
