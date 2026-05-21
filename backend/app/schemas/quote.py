from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import Field

from app.models.quote import QuoteStatus
from app.schemas.common import ORMModel, TimestampedRead


class QuotePositionRead(TimestampedRead):
    id: uuid.UUID
    position: int
    item_key: str | None
    label: str
    unit: str
    quantity: Decimal
    unit_price: Decimal | None
    line_total: Decimal | None
    needs_pricing: bool
    notes: str | None


class QuoteRead(TimestampedRead):
    id: uuid.UUID
    company_id: uuid.UUID
    inquiry_id: uuid.UUID | None
    customer_id: uuid.UUID | None
    number: str
    title: str
    status: QuoteStatus
    currency: str
    vat_rate: Decimal
    subtotal: Decimal
    vat_amount: Decimal
    total: Decimal
    needs_pricing: bool
    notes: str | None
    positions: list[QuotePositionRead] = []


class QuotePositionDraft(ORMModel):
    item_key: str | None = None
    label: str = Field(min_length=1, max_length=300)
    unit: str
    quantity: Decimal = Field(ge=0)
    unit_price: Decimal | None = None
    needs_pricing: bool = False
    notes: str | None = None


class QuoteDraft(ORMModel):
    title: str
    currency: str = "EUR"
    vat_rate: Decimal
    positions: list[QuotePositionDraft]
    subtotal: Decimal
    vat_amount: Decimal
    total: Decimal
    needs_pricing: bool


class GenerateQuoteRequest(ORMModel):
    price_list_id: uuid.UUID | None = None
    title: str | None = None
    notes: str | None = None


class QuoteUpdate(ORMModel):
    status: QuoteStatus | None = None
    title: str | None = None
    notes: str | None = None
