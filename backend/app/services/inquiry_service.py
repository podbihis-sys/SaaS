from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inquiry import Inquiry, InquiryStatus
from app.models.inquiry_image import InquiryImage
from app.repositories.inquiry_repo import InquiryRepository
from app.schemas.inquiry import InquiryCreate, InquiryUpdate


class InquiryService:
    def __init__(self, db: AsyncSession, company_id: uuid.UUID) -> None:
        self.db = db
        self.company_id = company_id
        self.repo = InquiryRepository(db, company_id)

    async def create(self, payload: InquiryCreate) -> Inquiry:
        inquiry = Inquiry(
            company_id=self.company_id,
            customer_id=payload.customer_id,
            title=payload.title,
            description=payload.description,
            contact_email=str(payload.contact_email) if payload.contact_email else None,
            contact_phone=payload.contact_phone,
            address_line1=payload.address_line1,
            postal_code=payload.postal_code,
            city=payload.city,
            status=InquiryStatus.NEW,
        )
        return await self.repo.add(inquiry)

    async def update(self, inquiry_id: uuid.UUID, payload: InquiryUpdate) -> Inquiry:
        inquiry = await self.repo.get_or_404(inquiry_id)
        data = payload.model_dump(exclude_unset=True)
        if "contact_email" in data and data["contact_email"] is not None:
            data["contact_email"] = str(data["contact_email"])
        for field, value in data.items():
            setattr(inquiry, field, value)
        await self.db.flush()
        return inquiry

    async def list(self, *, limit: int = 100, offset: int = 0) -> tuple[list[Inquiry], int]:
        items = await self.repo.list_with_images(limit=limit, offset=offset)
        total = await self.repo.count()
        return items, total

    async def get(self, inquiry_id: uuid.UUID) -> Inquiry:
        return await self.repo.get_with_images(inquiry_id)

    async def attach_image(
        self,
        inquiry_id: uuid.UUID,
        storage_path: str,
        public_url: str | None,
        content_type: str,
        size_bytes: int | None,
    ) -> InquiryImage:
        await self.repo.get_or_404(inquiry_id)
        image = InquiryImage(
            company_id=self.company_id,
            inquiry_id=inquiry_id,
            storage_path=storage_path,
            public_url=public_url,
            content_type=content_type,
            size_bytes=size_bytes,
        )
        return await self.repo.add_image(image)
