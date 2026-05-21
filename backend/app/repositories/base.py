from __future__ import annotations

import uuid
from typing import Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound, TenantMismatch
from app.models.base import TenantMixin

T = TypeVar("T")


class TenantRepository(Generic[T]):
    """Base repository that enforces company_id scoping on every read/write."""

    model: type[T]

    def __init__(self, db: AsyncSession, company_id: uuid.UUID) -> None:
        if not isinstance(company_id, uuid.UUID):
            raise TenantMismatch("company_id must be a UUID")
        self.db = db
        self.company_id = company_id

    def _scoped(self):  # type: ignore[no-untyped-def]
        if not issubclass(self.model, TenantMixin):
            return select(self.model)
        return select(self.model).where(self.model.company_id == self.company_id)  # type: ignore[attr-defined]

    async def get(self, entity_id: uuid.UUID) -> T | None:
        stmt = self._scoped().where(self.model.id == entity_id)  # type: ignore[attr-defined]
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_or_404(self, entity_id: uuid.UUID) -> T:
        instance = await self.get(entity_id)
        if instance is None:
            raise NotFound(f"{self.model.__name__} {entity_id} not found")
        return instance

    async def list(self, *, limit: int = 100, offset: int = 0) -> list[T]:
        stmt = self._scoped().order_by(self.model.created_at.desc()).limit(limit).offset(offset)  # type: ignore[attr-defined]
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)  # type: ignore[arg-type]
        if issubclass(self.model, TenantMixin):
            stmt = stmt.where(self.model.company_id == self.company_id)  # type: ignore[attr-defined]
        res = await self.db.execute(stmt)
        return int(res.scalar_one())

    async def add(self, entity: T) -> T:
        if issubclass(self.model, TenantMixin):
            cid = getattr(entity, "company_id", None)
            if cid is None:
                setattr(entity, "company_id", self.company_id)
            elif str(cid) != str(self.company_id):
                raise TenantMismatch("Entity company_id does not match repository scope")
        self.db.add(entity)
        await self.db.flush()
        return entity

    async def delete(self, entity: T) -> None:
        await self.db.delete(entity)
        await self.db.flush()
