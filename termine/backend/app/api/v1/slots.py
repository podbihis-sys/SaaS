from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.errors import NotFound
from app.deps import SessionDep
from app.models.enums import ServiceCategory
from app.models.slot import Slot
from app.schemas.catalog import SlotWithContext
from app.services.slot_query import available_slots_query, fetch_slots_with_context, to_context

router = APIRouter(prefix="/slots", tags=["slots"])


@router.get("", response_model=list[SlotWithContext])
async def list_slots(
    session: SessionDep,
    office_id: Annotated[list[uuid.UUID] | None, Query()] = None,
    category: Annotated[ServiceCategory | None, Query()] = None,
    service_id: Annotated[uuid.UUID | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
) -> list[SlotWithContext]:
    """Everything currently free, soonest first.

    This is a cache of the last scan, not a live read of the booking system —
    an appointment can be taken by somebody else between the scan and the tap,
    which is why the app always sends the user to the official portal to
    confirm.
    """
    statement = available_slots_query(
        office_ids=office_id, category=category, service_id=service_id
    )
    return await fetch_slots_with_context(session, statement, limit)


@router.get("/{slot_id}", response_model=SlotWithContext)
async def get_slot(slot_id: uuid.UUID, session: SessionDep) -> SlotWithContext:
    slot = (
        await session.execute(
            select(Slot)
            .where(Slot.id == slot_id)
            .options(selectinload(Slot.office), selectinload(Slot.service))
        )
    ).scalar_one_or_none()
    if slot is None:
        raise NotFound("Slot not found")
    return to_context(slot)
