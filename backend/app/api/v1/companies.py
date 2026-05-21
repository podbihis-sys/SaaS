from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Forbidden
from app.deps import CurrentUser, get_current_company_id, get_current_user, get_db
from app.repositories.company_repo import CompanyRepository
from app.schemas.company import (
    CompanyCreate,
    CompanyRead,
    CompanySettingsRead,
    CompanySettingsUpdate,
    CompanyUpdate,
)
from app.services.tenant_service import TenantService

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
async def create_company(
    payload: CompanyCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyRead:
    service = TenantService(db)
    company = await service.create_company(payload, owner_user_id=user.id)
    return CompanyRead.model_validate(company)


@router.get("/me", response_model=CompanyRead)
async def get_current_company(
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CompanyRead:
    repo = CompanyRepository(db)
    company = await repo.get_or_404(company_id)
    return CompanyRead.model_validate(company)


@router.patch("/{cid}", response_model=CompanyRead)
async def update_company(
    cid: uuid.UUID,
    payload: CompanyUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CompanyRead:
    if cid != company_id:
        raise Forbidden("Cannot modify a company outside active tenant")
    service = TenantService(db)
    company = await service.update_company(cid, payload)
    return CompanyRead.model_validate(company)


@router.get("/me/settings", response_model=CompanySettingsRead)
async def get_settings(
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CompanySettingsRead:
    service = TenantService(db)
    cs = await service.get_or_create_settings(company_id)
    return CompanySettingsRead.model_validate(cs)


@router.patch("/me/settings", response_model=CompanySettingsRead)
async def update_settings(
    payload: CompanySettingsUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CompanySettingsRead:
    service = TenantService(db)
    cs = await service.get_or_create_settings(company_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cs, field, value)
    await db.flush()
    return CompanySettingsRead.model_validate(cs)
