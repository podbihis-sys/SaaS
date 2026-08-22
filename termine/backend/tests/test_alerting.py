"""Alerting is where a useful app turns into an annoying one if it gets it wrong."""

from __future__ import annotations

from datetime import time, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Notification, Office, Service, Slot, User, Watch
from app.models.base import utcnow
from app.models.enums import NotificationStatus, ServiceCategory, SlotStatus
from app.services import alerting as alerting_module
from app.services.alerting import alert_for_slots


async def make_slot(session: AsyncSession, office: Office, service: Service, hours: int) -> Slot:
    slot = Slot(
        office_id=office.id,
        service_id=service.id,
        starts_at=utcnow() + timedelta(hours=hours),
        status=SlotStatus.AVAILABLE,
    )
    session.add(slot)
    await session.flush()
    return slot


async def make_watch(session: AsyncSession, user: User, office: Office, **kwargs) -> Watch:
    watch = Watch(
        user_id=user.id,
        label="Perso",
        category=ServiceCategory.PERSONALAUSWEIS,
        min_lead_hours=0,
        **kwargs,
    )
    watch.offices = [office]
    session.add(watch)
    await session.flush()
    return watch


async def test_matching_slot_produces_a_pending_notification(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    watch = await make_watch(session, user, office)
    slot = await make_slot(session, office, service, 48)

    ready = await alert_for_slots(session, [slot.id])

    assert len(ready) == 1
    notification = await session.get(Notification, ready[0])
    assert notification is not None
    assert notification.status == NotificationStatus.PENDING
    assert notification.watch_id == watch.id
    assert "Termin frei" in notification.title
    assert office.name in notification.body


async def test_same_slot_never_notifies_twice(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    """A slot that flickers must not buzz the phone on every reappearance."""
    await make_watch(session, user, office)
    slot = await make_slot(session, office, service, 48)

    first = await alert_for_slots(session, [slot.id])
    second = await alert_for_slots(session, [slot.id])

    assert len(first) == 1
    assert second == []
    count = len((await session.execute(select(Notification))).scalars().all())
    assert count == 1


async def test_non_matching_slot_is_ignored(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    """The watch only wants mornings; an afternoon slot is not an alert."""
    await make_watch(session, user, office, earliest_time=time(8, 0), latest_time=time(9, 0))
    slot = Slot(
        office_id=office.id,
        service_id=service.id,
        # 15:00 UTC is well past 09:00 Berlin under any offset.
        starts_at=(utcnow() + timedelta(days=2)).replace(hour=15, minute=0),
        status=SlotStatus.AVAILABLE,
    )
    session.add(slot)
    await session.flush()

    assert await alert_for_slots(session, [slot.id]) == []


async def test_other_users_watch_is_not_notified(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    other = User(install_id="someone-else-0002")
    session.add(other)
    await session.flush()
    await make_watch(session, other, office)
    slot = await make_slot(session, office, service, 48)

    ready = await alert_for_slots(session, [slot.id])

    notification = await session.get(Notification, ready[0])
    assert notification is not None
    assert notification.user_id == other.id


async def test_hourly_cap_throttles_a_burst(
    session: AsyncSession, user: User, office: Office, service: Service, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A cancellation wave must not turn into forty pushes."""
    monkeypatch.setattr(alerting_module.settings, "NOTIFY_MAX_PER_HOUR", 3)
    await make_watch(session, user, office)
    slots = [await make_slot(session, office, service, 24 + i) for i in range(6)]

    ready = await alert_for_slots(session, [s.id for s in slots])

    assert len(ready) == 3
    statuses = [
        n.status for n in (await session.execute(select(Notification))).scalars().all()
    ]
    assert statuses.count(NotificationStatus.PENDING) == 3
    assert statuses.count(NotificationStatus.THROTTLED) == 3


async def test_quiet_hours_records_without_pushing(
    session: AsyncSession, user: User, office: Office, service: Service, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Silenced alerts still show up in the app's history."""
    monkeypatch.setattr(alerting_module, "in_quiet_hours", lambda *_args, **_kwargs: True)
    await make_watch(session, user, office, quiet_hours_start=time(22, 0), quiet_hours_end=time(7, 0))
    slot = await make_slot(session, office, service, 48)

    ready = await alert_for_slots(session, [slot.id])

    assert ready == []
    notification = (await session.execute(select(Notification))).scalars().one()
    assert notification.status == NotificationStatus.THROTTLED


async def test_daily_limit_caps_alerts(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    """"Höchstens 2 pro Tag" must mean two, not two per burst."""
    await make_watch(session, user, office, daily_alert_limit=2)
    slots = [await make_slot(session, office, service, 24 + i) for i in range(5)]

    ready = await alert_for_slots(session, [s.id for s in slots])

    assert len(ready) == 2
    statuses = [n.status for n in (await session.execute(select(Notification))).scalars().all()]
    assert statuses.count(NotificationStatus.THROTTLED) == 3


async def test_daily_limit_counts_across_separate_batches(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    """The cap is per day, so a second scan an hour later must not reset it."""
    await make_watch(session, user, office, daily_alert_limit=2)
    first = [await make_slot(session, office, service, 24 + i) for i in range(2)]
    later = [await make_slot(session, office, service, 30 + i) for i in range(2)]

    assert len(await alert_for_slots(session, [s.id for s in first])) == 2
    assert await alert_for_slots(session, [s.id for s in later]) == []


async def test_no_daily_limit_means_no_daily_cap(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    await make_watch(session, user, office, daily_alert_limit=None)
    slots = [await make_slot(session, office, service, 24 + i) for i in range(5)]

    assert len(await alert_for_slots(session, [s.id for s in slots])) == 5


async def test_auto_stop_retires_the_watch(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    """Someone who needs one appointment should not have to delete the watch."""
    watch = await make_watch(session, user, office, auto_stop_after=1)
    slots = [await make_slot(session, office, service, 24 + i) for i in range(3)]

    ready = await alert_for_slots(session, [s.id for s in slots])

    assert len(ready) == 1
    assert watch.active is False
    # And it stays quiet afterwards.
    more = await make_slot(session, office, service, 72)
    assert await alert_for_slots(session, [more.id]) == []


async def test_auto_stop_does_not_silence_other_watches(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    """One user hitting their limit must not cut off everybody else's alerts."""
    other = User(install_id="second-person-0004")
    session.add(other)
    await session.flush()

    stopping = await make_watch(session, user, office, auto_stop_after=1)
    running = await make_watch(session, other, office)
    slots = [await make_slot(session, office, service, 24 + i) for i in range(3)]

    ready = await alert_for_slots(session, [s.id for s in slots])

    notifications = (await session.execute(select(Notification))).scalars().all()
    by_watch = {w: [n for n in notifications if n.watch_id == w] for w in (stopping.id, running.id)}
    assert len(by_watch[stopping.id]) == 1
    assert len(by_watch[running.id]) == 3
    assert len(ready) == 4
    assert running.active is True


async def test_inactive_watch_gets_nothing(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    await make_watch(session, user, office, active=False)
    slot = await make_slot(session, office, service, 48)

    assert await alert_for_slots(session, [slot.id]) == []


async def test_watch_counters_advance(
    session: AsyncSession, user: User, office: Office, service: Service
) -> None:
    watch = await make_watch(session, user, office)
    slot = await make_slot(session, office, service, 48)

    await alert_for_slots(session, [slot.id])

    assert watch.notification_count == 1
    assert watch.last_notified_at is not None


async def test_empty_input_is_a_noop(session: AsyncSession) -> None:
    assert await alert_for_slots(session, []) == []
