from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_company_id, get_db
from app.schemas.common import Paged, PageMeta
from app.schemas.inquiry import (
    InquiryCreate,
    InquiryImageRead,
    InquiryImageUploadRequest,
    InquiryImageUploadResponse,
    InquiryRead,
    InquiryUpdate,
)
from app.services.inquiry_service import InquiryService
from app.services.storage_service import StorageService

router = APIRouter(prefix="/inquiries", tags=["inquiries"])


@router.get("", response_model=Paged[InquiryRead])
async def list_inquiries(
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
) -> Paged[InquiryRead]:
    service = InquiryService(db, company_id)
    items, total = await service.list(limit=page_size, offset=(page - 1) * page_size)
    return Paged[InquiryRead](
        items=[InquiryRead.model_validate(i) for i in items],
        meta=PageMeta(total=total, page=page, page_size=page_size),
    )


@router.post("", response_model=InquiryRead, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    payload: InquiryCreate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> InquiryRead:
    service = InquiryService(db, company_id)
    inquiry = await service.create(payload)
    full = await service.get(inquiry.id)
    return InquiryRead.model_validate(full)


@router.get("/{inquiry_id}", response_model=InquiryRead)
async def get_inquiry(
    inquiry_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> InquiryRead:
    service = InquiryService(db, company_id)
    inq = await service.get(inquiry_id)
    return InquiryRead.model_validate(inq)


@router.patch("/{inquiry_id}", response_model=InquiryRead)
async def update_inquiry(
    inquiry_id: uuid.UUID,
    payload: InquiryUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> InquiryRead:
    service = InquiryService(db, company_id)
    await service.update(inquiry_id, payload)
    full = await service.get(inquiry_id)
    return InquiryRead.model_validate(full)


@router.post(
    "/{inquiry_id}/images",
    response_model=InquiryImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_image_upload(
    inquiry_id: uuid.UUID,
    payload: InquiryImageUploadRequest,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> InquiryImageUploadResponse:
    storage = StorageService()
    target = await storage.create_signed_upload(company_id, inquiry_id, payload.filename)
    service = InquiryService(db, company_id)
    image = await service.attach_image(
        inquiry_id=inquiry_id,
        storage_path=target.storage_path,
        public_url=target.public_url,
        content_type=payload.content_type,
        size_bytes=payload.size_bytes,
    )
    return InquiryImageUploadResponse(
        image_id=image.id,
        storage_path=target.storage_path,
        upload_url=target.upload_url,
        public_url=target.public_url,
    )


@router.get("/{inquiry_id}/images", response_model=list[InquiryImageRead])
async def list_inquiry_images(
    inquiry_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> list[InquiryImageRead]:
    service = InquiryService(db, company_id)
    inq = await service.get(inquiry_id)
    return [InquiryImageRead.model_validate(img) for img in inq.images]
