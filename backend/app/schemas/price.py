from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import Field

from app.models.price_item import PriceItemKind
from app.schemas.common import ORMModel, TimestampedRead


class PriceListCreate(ORMModel):
    name: str = Field(min_length=1, max_length=200)
    is_default: bool = False
    currency: str = "EUR"


class PriceListUpdate(ORMModel):
    name: str | None = None
    is_default: bool | None = None
    currency: str | None = None


class PriceListRead(TimestampedRead):
    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    is_default: bool
    currency: str


class PriceItemCreate(ORMModel):
    price_list_id: uuid.UUID
    key: str = Field(min_length=1, max_length=120)
    label: str = Field(min_length=1, max_length=200)
    kind: PriceItemKind
    unit: str = Field(min_length=1, max_length=20)
    unit_price: Decimal = Field(ge=0)
    currency: str = "EUR"


class PriceItemUpdate(ORMModel):
    label: str | None = None
    kind: PriceItemKind | None = None
    unit: str | None = None
    unit_price: Decimal | None = None
    currency: str | None = None


class PriceItemRead(TimestampedRead):
    id: uuid.UUID
    company_id: uuid.UUID
    price_list_id: uuid.UUID
    key: str
    label: str
    kind: PriceItemKind
    unit: str
    unit_price: Decimal
    currency: str
