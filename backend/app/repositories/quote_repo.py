from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.errors import NotFound
from app.models.quote import Quote
from app.models.quote_position import QuotePosition
from app.repositories.base import TenantRepository


class QuoteRepository(TenantRepository[Quote]):
    model = Quote

    async def get_with_positions(self, quote_id: uuid.UUID) -> Quote:
        stmt = (
            select(Quote)
            .where(Quote.company_id == self.company_id, Quote.id == quote_id)
            .options(selectinload(Quote.positions))
        )
        res = await self.db.execute(stmt)
        q = res.scalar_one_or_none()
        if q is None:
            raise NotFound(f"Quote {quote_id} not found")
        return q

    async def list_with_positions(self, *, limit: int = 100, offset: int = 0) -> list[Quote]:
        stmt = (
            select(Quote)
            .where(Quote.company_id == self.company_id)
            .options(selectinload(Quote.positions))
            .order_by(Quote.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def add_position(self, position: QuotePosition) -> QuotePosition:
        if position.company_id is None:
            position.company_id = self.company_id
        self.db.add(position)
        await self.db.flush()
        return position
