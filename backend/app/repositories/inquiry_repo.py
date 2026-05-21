from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.errors import NotFound
from app.models.ai_analysis import AIAnalysis
from app.models.inquiry import Inquiry
from app.models.inquiry_image import InquiryImage
from app.repositories.base import TenantRepository


class InquiryRepository(TenantRepository[Inquiry]):
    model = Inquiry

    async def get_with_images(self, inquiry_id: uuid.UUID) -> Inquiry:
        stmt = (
            select(Inquiry)
            .where(Inquiry.company_id == self.company_id, Inquiry.id == inquiry_id)
            .options(selectinload(Inquiry.images), selectinload(Inquiry.analyses))
        )
        res = await self.db.execute(stmt)
        instance = res.scalar_one_or_none()
        if instance is None:
            raise NotFound(f"Inquiry {inquiry_id} not found")
        return instance

    async def list_with_images(self, *, limit: int = 100, offset: int = 0) -> list[Inquiry]:
        stmt = (
            select(Inquiry)
            .where(Inquiry.company_id == self.company_id)
            .options(selectinload(Inquiry.images))
            .order_by(Inquiry.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def add_image(self, image: InquiryImage) -> InquiryImage:
        if image.company_id is None:
            image.company_id = self.company_id
        self.db.add(image)
        await self.db.flush()
        return image

    async def add_analysis(self, analysis: AIAnalysis) -> AIAnalysis:
        if analysis.company_id is None:
            analysis.company_id = self.company_id
        self.db.add(analysis)
        await self.db.flush()
        return analysis

    async def latest_analysis(self, inquiry_id: uuid.UUID) -> AIAnalysis | None:
        stmt = (
            select(AIAnalysis)
            .where(
                AIAnalysis.company_id == self.company_id,
                AIAnalysis.inquiry_id == inquiry_id,
            )
            .order_by(AIAnalysis.created_at.desc())
            .limit(1)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
