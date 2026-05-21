from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_company_id, get_db
from app.models.ai_analysis import AIAnalysis
from app.models.inquiry import InquiryStatus
from app.repositories.inquiry_repo import InquiryRepository
from app.schemas.ai import AIAnalysisRead, AIAnalysisResult, AnalyzeRequest
from app.services.ai_service import AIService
from app.services.storage_service import StorageService

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze", response_model=AIAnalysisRead)
async def analyze_inquiry(
    payload: AnalyzeRequest,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> AIAnalysisRead:
    repo = InquiryRepository(db, company_id)
    inquiry = await repo.get_with_images(payload.inquiry_id)

    inquiry.status = InquiryStatus.AI_PENDING
    await db.flush()

    storage = StorageService()
    image_urls: list[str] = []
    for img in inquiry.images:
        if img.public_url:
            image_urls.append(img.public_url)
        else:
            try:
                image_urls.append(await storage.create_signed_download(img.storage_path))
            except Exception:
                continue

    ai = AIService()
    result: AIAnalysisResult = await ai.analyze_inquiry(inquiry.description, image_urls)

    analysis = AIAnalysis(
        company_id=company_id,
        inquiry_id=inquiry.id,
        model=ai.model,
        result=result.model_dump(),
    )
    await repo.add_analysis(analysis)
    inquiry.status = InquiryStatus.AI_DONE
    await db.flush()
    return AIAnalysisRead(
        id=analysis.id,
        inquiry_id=analysis.inquiry_id,
        model=analysis.model,
        result=result,
        created_at=analysis.created_at,
        updated_at=analysis.updated_at,
    )
