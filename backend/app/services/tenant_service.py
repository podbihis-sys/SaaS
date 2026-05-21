from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.errors import Conflict
from app.models.company import Company
from app.models.membership import Membership, MembershipRole
from app.models.settings import CompanySettings
from app.repositories.company_repo import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyUpdate


class TenantService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = CompanyRepository(db)

    async def create_company(
        self, payload: CompanyCreate, owner_user_id: uuid.UUID
    ) -> Company:
        existing = await self.repo.get_by_slug(payload.slug)
        if existing is not None:
            raise Conflict(f"Company slug '{payload.slug}' already exists")

        company = Company(
            name=payload.name,
            slug=payload.slug,
            legal_name=payload.legal_name,
            tax_id=payload.tax_id,
            address_line1=payload.address_line1,
            postal_code=payload.postal_code,
            city=payload.city,
            country=payload.country,
            phone=payload.phone,
            email=str(payload.email) if payload.email else None,
        )
        await self.repo.add(company)

        membership = Membership(
            company_id=company.id,
            user_id=owner_user_id,
            role=MembershipRole.OWNER,
            is_active=True,
        )
        await self.repo.add_membership(membership)

        company_settings = CompanySettings(
            company_id=company.id,
            vat_rate=Decimal(str(settings.DEFAULT_VAT_RATE)),
            currency=settings.DEFAULT_CURRENCY,
        )
        await self.repo.add_settings(company_settings)
        return company

    async def update_company(self, company_id: uuid.UUID, payload: CompanyUpdate) -> Company:
        company = await self.repo.get_or_404(company_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(company, field, value)
        await self.db.flush()
        return company

    async def get_or_create_settings(self, company_id: uuid.UUID) -> CompanySettings:
        existing = await self.repo.get_settings(company_id)
        if existing is not None:
            return existing
        cs = CompanySettings(
            company_id=company_id,
            vat_rate=Decimal(str(settings.DEFAULT_VAT_RATE)),
            currency=settings.DEFAULT_CURRENCY,
        )
        await self.repo.add_settings(cs)
        return cs
