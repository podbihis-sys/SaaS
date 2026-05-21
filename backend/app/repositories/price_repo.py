from __future__ import annotations

import uuid

from sqlalchemy import select

from app.core.errors import NotFound
from app.models.price_item import PriceItem
from app.models.price_list import PriceList
from app.repositories.base import TenantRepository


class PriceListRepository(TenantRepository[PriceList]):
    model = PriceList

    async def get_default(self) -> PriceList | None:
        stmt = (
            select(PriceList)
            .where(PriceList.company_id == self.company_id, PriceList.is_default.is_(True))
            .limit(1)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def first(self) -> PriceList | None:
        stmt = (
            select(PriceList)
            .where(PriceList.company_id == self.company_id)
            .order_by(PriceList.created_at.asc())
            .limit(1)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()


class PriceItemRepository(TenantRepository[PriceItem]):
    model = PriceItem

    async def list_for_list(self, price_list_id: uuid.UUID) -> list[PriceItem]:
        stmt = (
            select(PriceItem)
            .where(
                PriceItem.company_id == self.company_id,
                PriceItem.price_list_id == price_list_id,
            )
            .order_by(PriceItem.label.asc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def by_keys(self, price_list_id: uuid.UUID, keys: list[str]) -> dict[str, PriceItem]:
        if not keys:
            return {}
        stmt = select(PriceItem).where(
            PriceItem.company_id == self.company_id,
            PriceItem.price_list_id == price_list_id,
            PriceItem.key.in_(keys),
        )
        res = await self.db.execute(stmt)
        return {item.key: item for item in res.scalars().all()}

    async def get_or_404(self, entity_id: uuid.UUID) -> PriceItem:
        instance = await self.get(entity_id)
        if instance is None:
            raise NotFound(f"PriceItem {entity_id} not found")
        return instance
