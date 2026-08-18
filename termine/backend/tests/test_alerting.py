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
