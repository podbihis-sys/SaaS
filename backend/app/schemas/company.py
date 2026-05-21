from __future__ import annotations

import uuid
from decimal import Decimal

from pydantic import EmailStr, Field

from app.schemas.common import ORMModel, TimestampedRead


class CompanyCreate(ORMModel):
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    legal_name: str | None = None
    tax_id: str | None = None
    address_line1: str | None = None
    postal_code: str | None = None
    city: str | None = None
    country: str = "DE"
    phone: str | None = None
    email: EmailStr | None = None


class CompanyUpdate(ORMModel):
    name: str | None = None
    legal_name: str | None = None
    tax_id: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    postal_code: str | None = None
    city: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    logo_url: str | None = None


class CompanyRead(TimestampedRead):
    id: uuid.UUID
    name: str
    slug: str
    legal_name: str | None
    tax_id: str | None
    address_line1: str | None
    address_line2: str | None
    postal_code: str | None
    city: str | None
    country: str
    phone: str | None
    email: str | None
    logo_url: str | None


class CompanySettingsUpdate(ORMModel):
    vat_rate: Decimal | None = None
    currency: str | None = None
    quote_number_prefix: str | None = None
    logo_url: str | None = None
    bank_name: str | None = None
    iban: str | None = None
    bic: str | None = None
    locale: str | None = None


class CompanySettingsRead(TimestampedRead):
    id: uuid.UUID
    company_id: uuid.UUID
    vat_rate: Decimal
    currency: str
    quote_number_prefix: str
    quote_number_counter: int
    logo_url: str | None
    bank_name: str | None
    iban: str | None
    bic: str | None
    locale: str
