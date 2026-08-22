from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

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


async def _daily_limit_reached(session: AsyncSession, watch: Watch, now: datetime, timezone: str) -> bool:
    """Whether this watch has used up the alerts the user allowed for today.

    "Today" is the calendar day where the office is, matching how quiet hours
    are evaluated — a limit of three should reset at local midnight, not at
    whatever time UTC happens to roll over.
    """
    if watch.daily_alert_limit is None:
        return False

    local_midnight = now.astimezone(ZoneInfo(timezone)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    count = await session.scalar(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.watch_id == watch.id,
            Notification.status.in_((NotificationStatus.PENDING, NotificationStatus.SENT)),
            Notification.created_at >= local_midnight.astimezone(UTC),
        )
    )
    return (count or 0) >= watch.daily_alert_limit


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

            # Three independent reasons to stay silent, checked cheapest first.
            # Delaying a slot alert is pointless — it will be gone by morning —
            # so a suppressed alert is recorded rather than queued, and shows up
            # in the app's history as something the user missed.
            suppressed = (
                in_quiet_hours(watch, now, office.timezone)
                or await _daily_limit_reached(session, watch, now, office.timezone)
                or await _rate_limited(session, watch.id)
            )
            status = NotificationStatus.THROTTLED if suppressed else NotificationStatus.PENDING

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

                if watch.auto_stop_after is not None and watch.notification_count >= watch.auto_stop_after:
                    # The user asked for a fixed number of alerts and has had
                    # them. Retiring the watch here also stops the scanner from
                    # polling on its behalf, since `due_pairs` only considers
                    # active watches. No break: the remaining watches in this
                    # loop belong to other people and still want this slot.
                    # `slot_matches_watch` rejects an inactive watch, so the
                    # flag alone is enough to skip it for every later slot.
                    watch.active = False
                    log.info("alerting.watch_auto_stopped", watch_id=str(watch.id))

    await session.flush()
    log.info("alerting.matched", slots=len(slots), watches=len(watches), notifications=len(ready))
    return ready
