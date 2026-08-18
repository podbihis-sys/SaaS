from __future__ import annotations

import uuid
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.logging_config import get_logger
from app.models.base import utcnow
from app.models.enums import NotificationStatus
from app.models.notification import Notification
from app.models.office import Office, Service
from app.models.slot import Slot
from app.models.watch import Watch, watch_offices
from app.services.matcher import in_quiet_hours, slot_matches_watch
from app.services.notifier import build_alert_text

log = get_logger(__name__)


async def _rate_limited(session: AsyncSession, watch_id: uuid.UUID) -> bool:
    """True when this watch has already had its hourly share of pushes.

    A cancellation wave at a busy Bürgeramt can free forty slots at once.
    Without this the user's phone would buzz forty times and they would turn
    notifications off, which defeats the entire product.
    """
    since = utcnow() - timedelta(hours=1)
    count = await session.scalar(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.watch_id == watch_id,
            # Counts everything we decided to push, including rows still
            # PENDING delivery in this very batch. Counting only SENT would let
            # a single burst through unchecked, because nothing is marked sent
            # until after the whole batch is matched.
            Notification.status.in_((NotificationStatus.PENDING, NotificationStatus.SENT)),
            Notification.created_at >= since,
        )
    )
    return (count or 0) >= settings.NOTIFY_MAX_PER_HOUR


async def alert_for_slots(session: AsyncSession, slot_ids: list[uuid.UUID]) -> list[uuid.UUID]:
    """Create notifications for every watch that wants one of these slots.

    Returns the ids of notifications that are ready to be pushed. Rows that are
    suppressed (duplicate, rate limited, quiet hours) are still written so the
    in-app history shows what was found even when the phone stayed silent.
    """
    if not slot_ids:
        return []

    slots = (
        await session.execute(
            select(Slot)
            .where(Slot.id.in_(slot_ids))
            .options(selectinload(Slot.office), selectinload(Slot.service))
        )
    ).scalars().all()
    if not slots:
        return []

    office_ids = {slot.office_id for slot in slots}
    categories = {slot.service.category for slot in slots}

    # Only watches that could possibly match are loaded: right errand, right
    # office, still active.
    watches = (
        await session.execute(
            select(Watch)
            .join(watch_offices, watch_offices.c.watch_id == Watch.id)
            .where(
                Watch.active.is_(True),
                Watch.category.in_(categories),
                watch_offices.c.office_id.in_(office_ids),
            )
            .options(selectinload(Watch.offices))
            .distinct()
        )
    ).scalars().all()
    if not watches:
        return []

    now = utcnow()
    ready: list[uuid.UUID] = []

    for slot in slots:
        office: Office = slot.office
        service: Service = slot.service
        for watch in watches:
            if not slot_matches_watch(
                watch=watch,
                category=service.category,
                office_id=slot.office_id,
                starts_at=slot.starts_at,
                office_timezone=office.timezone,
                now=now,
            ):
                continue

            title, body = build_alert_text(
                service_name=service.name,
                office_name=office.name,
                city=office.city,
                starts_at=slot.starts_at,
                timezone=office.timezone,
            )

            if in_quiet_hours(watch, now, office.timezone):
                # Delaying a slot alert is pointless — it will be gone by
                # morning — so it is recorded, not queued.
                status = NotificationStatus.THROTTLED
            elif await _rate_limited(session, watch.id):
                status = NotificationStatus.THROTTLED
            else:
                status = NotificationStatus.PENDING

            notification = Notification(
                watch_id=watch.id,
                slot_id=slot.id,
                user_id=watch.user_id,
                status=status,
                title=title,
                body=body,
            )
            try:
                # The unique (watch, slot) constraint is what stops a slot that
                # flickers in and out of availability from re-notifying. The
                # savepoint keeps that collision from discarding the
                # notifications already matched in this batch.
                async with session.begin_nested():
                    session.add(notification)
                    await session.flush()
            except IntegrityError:
                continue

            if status == NotificationStatus.PENDING:
                ready.append(notification.id)
                watch.last_notified_at = now
                watch.notification_count += 1

    await session.flush()
    log.info("alerting.matched", slots=len(slots), watches=len(watches), notifications=len(ready))
    return ready
