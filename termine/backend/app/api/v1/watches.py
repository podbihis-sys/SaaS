from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.errors import NotFound, ValidationError
from app.deps import CurrentUser, SessionDep
from app.models.base import utcnow
from app.models.notification import Notification
from app.models.office import Office
from app.models.watch import Watch
from app.schemas.common import Ack
from app.schemas.watch import (
    NotificationOut,
    WatchCreate,
    WatchDetail,
    WatchOut,
    WatchUpdate,
)
from app.services.matcher import slot_matches_watch
from app.services.slot_query import available_slots_query, fetch_slots_with_context

router = APIRouter(prefix="/watches", tags=["watches"])

#: A watch is only as useful as the offices behind it; more than this and the
#: scanner load per user stops being reasonable.
MAX_ACTIVE_WATCHES = 20


async def _load_offices(session: SessionDep, office_ids: list[uuid.UUID]) -> list[Office]:
    offices = (
        await session.execute(select(Office).where(Office.id.in_(office_ids), Office.active.is_(True)))
    ).scalars().all()
    missing = set(office_ids) - {o.id for o in offices}
    if missing:
        raise ValidationError(f"Unknown or inactive office ids: {sorted(str(m) for m in missing)}")
    return list(offices)


async def _get_owned(session: SessionDep, user_id: uuid.UUID, watch_id: uuid.UUID) -> Watch:
    watch = (
        await session.execute(
            select(Watch)
            .where(Watch.id == watch_id, Watch.user_id == user_id)
            .options(selectinload(Watch.offices))
        )
    ).scalar_one_or_none()
    if watch is None:
        raise NotFound("Watch not found")
    return watch


@router.get("", response_model=list[WatchOut])
async def list_watches(user: CurrentUser, session: SessionDep) -> list[Watch]:
    rows = (
        await session.execute(
            select(Watch)
            .where(Watch.user_id == user.id)
            .options(selectinload(Watch.offices))
            .order_by(Watch.active.desc(), Watch.created_at.desc())
        )
    ).scalars().all()
    return list(rows)


@router.post("", response_model=WatchOut, status_code=status.HTTP_201_CREATED)
async def create_watch(payload: WatchCreate, user: CurrentUser, session: SessionDep) -> Watch:
    active_count = len(
        (
            await session.execute(
                select(Watch.id).where(Watch.user_id == user.id, Watch.active.is_(True))
            )
        ).scalars().all()
    )
    if active_count >= MAX_ACTIVE_WATCHES:
        raise ValidationError(f"At most {MAX_ACTIVE_WATCHES} active watches per account")

    offices = await _load_offices(session, payload.office_ids)
    watch = Watch(
        user_id=user.id,
        label=payload.label,
        category=payload.category,
        earliest_date=payload.earliest_date,
        latest_date=payload.latest_date,
        weekday_mask=payload.weekday_mask,
        earliest_time=payload.earliest_time,
        latest_time=payload.latest_time,
        min_lead_hours=payload.min_lead_hours,
        daily_alert_limit=payload.daily_alert_limit,
        auto_stop_after=payload.auto_stop_after,
        quiet_hours_start=payload.quiet_hours_start,
        quiet_hours_end=payload.quiet_hours_end,
        expires_at=payload.expires_at,
    )
    watch.offices = offices
    session.add(watch)
    await session.flush()
    return watch


@router.get("/{watch_id}", response_model=WatchDetail)
async def get_watch(
    watch_id: uuid.UUID,
    user: CurrentUser,
    session: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
) -> WatchDetail:
    """The watch plus the slots that satisfy it right now.

    The same predicate that decides whether to send a push is reused here, so
    the list in the app can never disagree with the alerts it sends.
    """
    watch = await _get_owned(session, user.id, watch_id)
    office_ids = [office.id for office in watch.offices]
    office_tz = {office.id: office.timezone for office in watch.offices}

    candidates = await fetch_slots_with_context(
        session,
        available_slots_query(office_ids=office_ids, category=watch.category),
        limit * 4,
    )
    now = utcnow()
    matching = [
        slot
        for slot in candidates
        if slot_matches_watch(
            watch=watch,
            category=slot.category,
            office_id=slot.office_id,
            starts_at=slot.starts_at,
            office_timezone=office_tz.get(slot.office_id, "Europe/Berlin"),
            now=now,
        )
    ][:limit]

    detail = WatchDetail.model_validate(watch)
    detail.matching_slots = matching
    return detail


@router.patch("/{watch_id}", response_model=WatchOut)
async def update_watch(
    watch_id: uuid.UUID, payload: WatchUpdate, user: CurrentUser, session: SessionDep
) -> Watch:
    watch = await _get_owned(session, user.id, watch_id)
    data = payload.model_dump(exclude_unset=True)

    if office_ids := data.pop("office_ids", None):
        watch.offices = await _load_offices(session, office_ids)
    for field, value in data.items():
        setattr(watch, field, value)

    if watch.earliest_date and watch.latest_date and watch.earliest_date > watch.latest_date:
        raise ValidationError("earliest_date must not be after latest_date")

    await session.flush()
    return watch


@router.delete("/{watch_id}", response_model=Ack, status_code=status.HTTP_200_OK)
async def delete_watch(watch_id: uuid.UUID, user: CurrentUser, session: SessionDep) -> Ack:
    watch = await _get_owned(session, user.id, watch_id)
    await session.delete(watch)
    await session.flush()
    return Ack()


@router.get("/{watch_id}/notifications", response_model=list[NotificationOut])
async def list_watch_notifications(
    watch_id: uuid.UUID,
    user: CurrentUser,
    session: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Notification]:
    await _get_owned(session, user.id, watch_id)
    rows = (
        await session.execute(
            select(Notification)
            .where(Notification.watch_id == watch_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
    ).scalars().all()
    return list(rows)
