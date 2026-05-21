from __future__ import annotations

import enum
import uuid
from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Index, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID
from app.models.base import Base, TenantMixin, TimestampMixin, primary_key


class PriceItemKind(enum.StrEnum):
    LABOR = "labor"
    MATERIAL = "material"
    AREA = "area"
    FLAT = "flat"


class PriceItem(Base, TimestampMixin, TenantMixin):
    __tablename__ = "price_items"
    __table_args__ = (
        UniqueConstraint("price_list_id", "key", name="uq_price_items_list_key"),
        Index("ix_price_items_company_key", "company_id", "key"),
    )

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    price_list_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("price_lists.id", ondelete="CASCADE"), nullable=False, index=True
    )
    key: Mapped[str] = mapped_column(String(120), nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[PriceItemKind] = mapped_column(
        Enum(PriceItemKind, name="price_item_kind"), nullable=False
    )
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="EUR", nullable=False)

    price_list: Mapped[PriceList] = relationship(back_populates="items")  # noqa: F821
