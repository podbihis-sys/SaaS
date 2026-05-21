from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID
from app.models.base import Base, TenantMixin, TimestampMixin, primary_key


class PriceList(Base, TimestampMixin, TenantMixin):
    __tablename__ = "price_lists"

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR", nullable=False)

    items: Mapped[list["PriceItem"]] = relationship(  # noqa: F821
        back_populates="price_list", cascade="all, delete-orphan"
    )
