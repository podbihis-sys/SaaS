from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound
from app.models.company import Company
from app.models.membership import Membership
from app.models.settings import CompanySettings


class CompanyRepository:
    """Companies are not tenant-scoped themselves (they ARE the tenant)."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get(self, company_id: uuid.UUID) -> Company | None:
        return await self.db.get(Company, company_id)

    async def get_or_404(self, company_id: uuid.UUID) -> Company:
        c = await self.get(company_id)
        if c is None:
            raise NotFound(f"Company {company_id} not found")
        return c

    async def get_by_slug(self, slug: str) -> Company | None:
        res = await self.db.execute(select(Company).where(Company.slug == slug))
        return res.scalar_one_or_none()

    async def add(self, company: Company) -> Company:
        self.db.add(company)
        await self.db.flush()
        return company

    async def add_membership(self, membership: Membership) -> Membership:
        self.db.add(membership)
        await self.db.flush()
        return membership

    async def list_memberships_for_user(self, user_id: uuid.UUID) -> list[Membership]:
        stmt = (
            select(Membership)
            .where(Membership.user_id == user_id, Membership.is_active.is_(True))
            .order_by(Membership.created_at.asc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_settings(self, company_id: uuid.UUID) -> CompanySettings | None:
        stmt = select(CompanySettings).where(CompanySettings.company_id == company_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def add_settings(self, settings_obj: CompanySettings) -> CompanySettings:
        self.db.add(settings_obj)
        await self.db.flush()
        return settings_obj
