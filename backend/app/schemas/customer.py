from __future__ import annotations

import uuid

from pydantic import EmailStr, Field

from app.schemas.common import ORMModel, TimestampedRead


class CustomerCreate(ORMModel):
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    postal_code: str | None = None
    city: str | None = None
    country: str = "DE"
    notes: str | None = None


class CustomerUpdate(ORMModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    postal_code: str | None = None
    city: str | None = None
    country: str | None = None
    notes: str | None = None


class CustomerRead(TimestampedRead):
    id: uuid.UUID
    company_id: uuid.UUID
    full_name: str
    email: str | None
    phone: str | None
    address_line1: str | None
    address_line2: str | None
    postal_code: str | None
    city: str | None
    country: str
    notes: str | None
