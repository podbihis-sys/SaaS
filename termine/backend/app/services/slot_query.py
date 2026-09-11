from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.base import utcnow
from app.models.enums import ServiceCategory, SlotStatus
from app.models.office import Office, Service
from app.models.slot import Slot
from app.schemas.catalog import SlotWithContext


def available_slots_query(
    *,
    office_ids: list[uuid.UUID] | None = None,
    category: ServiceCategory | None = None,
    service_id: uuid.UUID | None = None,
    not_before: datetime | None = None,
) -> Select:
    """Base query for slots a user could still take.

    ``GONE`` slots are excluded and past slots are cut off, so callers never
    have to remember either rule.
    """
    statement = (
        select(Slot)
        .join(Service, Service.id == Slot.service_id)
        .where(Slot.status == SlotStatus.AVAILABLE, Slot.starts_at >= (not_before or utcnow()))
        .options(selectinload(Slot.office), selectinload(Slot.service))
    )
    if office_ids:
        statement = statement.where(Slot.office_id.in_(office_ids))
    if category:
        statement = statement.where(Service.category == category)
    if service_id:
        statement = statement.where(Slot.service_id == service_id)
    return statement.order_by(Slot.starts_at)


def to_context(slot: Slot) -> SlotWithContext:
    office: Office = slot.office
    service: Service = slot.service
    return SlotWithContext(
        id=slot.id,
        office_id=slot.office_id,
        service_id=slot.service_id,
        starts_at=slot.starts_at,
        ends_at=slot.ends_at,
        capacity=slot.capacity,
        status=slot.status,
        first_seen_at=slot.first_seen_at,
        last_seen_at=slot.last_seen_at,
        office_name=office.name,
        city=office.city,
        service_name=service.name,
        category=service.category,
        timezone=office.timezone,
    )


async def fetch_slots_with_context(session: AsyncSession, statement: Select, limit: int) -> list[SlotWithContext]:
    rows = (await session.execute(statement.limit(limit))).scalars().all()
    return [to_context(slot) for slot in rows]
