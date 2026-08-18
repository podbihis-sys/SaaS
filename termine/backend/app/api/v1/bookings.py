from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.errors import NotFound, ValidationError
from app.deps import CurrentUser, SessionDep
from app.models.base import utcnow
from app.models.enums import BookingStatus, SlotStatus
from app.models.notification import BookingIntent
from app.models.slot import Slot
from app.models.watch import Watch
from app.providers import get_provider, office_ref, service_ref
from app.providers.base import RawSlot
from app.schemas.watch import BookingCreate, BookingOut, BookingResolve

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(payload: BookingCreate, user: CurrentUser, session: SessionDep) -> BookingIntent:
    """Hand the user off to the authority's own booking flow.

    The app does not book on anyone's behalf. Every one of these systems puts a
    CAPTCHA and a personal-data form in front of the final step, and automating
    past that would breach their terms of use and hand us data we have no reason
    to hold. What this endpoint does instead is produce the deepest link the
    booking system supports — ideally the exact time already selected — and
    record that the handoff happened, so the app can ask later whether it worked.
    """
    slot = (
        await session.execute(
            select(Slot)
            .where(Slot.id == payload.slot_id)
            .options(selectinload(Slot.office), selectinload(Slot.service))
        )
    ).scalar_one_or_none()
    if slot is None:
        raise NotFound("Slot not found")
    if slot.status != SlotStatus.AVAILABLE:
        raise ValidationError("This appointment is no longer listed as free")
    if slot.starts_at <= utcnow():
        raise ValidationError("This appointment is in the past")

    if payload.watch_id is not None:
        owned = await session.scalar(
            select(Watch.id).where(Watch.id == payload.watch_id, Watch.user_id == user.id)
        )
        if owned is None:
            raise NotFound("Watch not found")

    provider = get_provider(slot.office.provider)
    handoff_url = provider.booking_url(
        office_ref(slot.office),
        service_ref(slot.service),
        RawSlot(starts_at=slot.starts_at, ends_at=slot.ends_at, provider_ref=slot.provider_ref),
    )

    intent = BookingIntent(
        user_id=user.id,
        slot_id=slot.id,
        watch_id=payload.watch_id,
        status=BookingStatus.HANDED_OFF,
        handoff_url=handoff_url,
    )
    session.add(intent)
    await session.flush()
    return intent


@router.get("", response_model=list[BookingOut])
async def list_bookings(
    user: CurrentUser,
    session: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[BookingIntent]:
    rows = (
        await session.execute(
            select(BookingIntent)
            .where(BookingIntent.user_id == user.id)
            .order_by(BookingIntent.created_at.desc())
            .limit(limit)
        )
    ).scalars().all()
    return list(rows)


@router.post("/{booking_id}/resolve", response_model=BookingOut)
async def resolve_booking(
    booking_id: uuid.UUID, payload: BookingResolve, user: CurrentUser, session: SessionDep
) -> BookingIntent:
    """Record how the handoff went.

    Confirming a booking retires the watch that produced it: continuing to
    notify somebody about an errand they have already done is the fastest way
    to get the app deleted.
    """
    intent = (
        await session.execute(
            select(BookingIntent).where(BookingIntent.id == booking_id, BookingIntent.user_id == user.id)
        )
    ).scalar_one_or_none()
    if intent is None:
        raise NotFound("Booking not found")

    intent.status = payload.status
    intent.note = payload.note
    intent.resolved_at = utcnow()

    if payload.status == BookingStatus.CONFIRMED and intent.watch_id:
        watch = await session.get(Watch, intent.watch_id)
        if watch is not None and watch.user_id == user.id:
            watch.active = False

    await session.flush()
    return intent
