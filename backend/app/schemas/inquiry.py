from __future__ import annotations

import uuid

from pydantic import EmailStr, Field

from app.models.inquiry import InquiryStatus
from app.schemas.common import ORMModel, TimestampedRead


class InquiryCreate(ORMModel):
    customer_id: uuid.UUID | None = None
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address_line1: str | None = None
    postal_code: str | None = None
    city: str | None = None


class InquiryUpdate(ORMModel):
    customer_id: uuid.UUID | None = None
    title: str | None = None
    description: str | None = None
    status: InquiryStatus | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address_line1: str | None = None
    postal_code: str | None = None
    city: str | None = None


class InquiryImageRead(TimestampedRead):
    id: uuid.UUID
    storage_path: str
    public_url: str | None
    content_type: str
    size_bytes: int | None


class InquiryRead(TimestampedRead):
    id: uuid.UUID
    company_id: uuid.UUID
    customer_id: uuid.UUID | None
    title: str
    description: str | None
    status: InquiryStatus
    contact_email: str | None
    contact_phone: str | None
    address_line1: str | None
    postal_code: str | None
    city: str | None
    images: list[InquiryImageRead] = []


class InquiryImageUploadRequest(ORMModel):
    filename: str
    content_type: str = "image/jpeg"
    size_bytes: int | None = None


class InquiryImageUploadResponse(ORMModel):
    image_id: uuid.UUID
    storage_path: str
    upload_url: str | None
    public_url: str | None
