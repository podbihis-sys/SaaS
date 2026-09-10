from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from datetime import date, timedelta

import httpx
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.core.errors import ProviderError
from app.database import get_sessionmaker
from app.logging_config import get_logger
from app.models.base import utcnow
from app.models.enums import ScanStatus, SlotStatus
from app.models.office import Office, Service
from app.models.slot import ScanRun, Slot
from app.models.watch import Watch, watch_offices
from app.providers import build_client, get_provider, is_enabled, office_ref, service_ref
from app.providers.robots import robots
from app.services.alerting import alert_for_slots
from app.services.notifier import deliver_pending

log = get_logger(__name__)


@dataclass(slots=True)
class ScanResult:
    seen: int = 0
    new_slot_ids: list[uuid.UUID] = field(default_factory=list)
    gone: int = 0
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None


async def scan_pair(
    session: AsyncSession,
    office: Office,
    service: Service,
    client: httpx.AsyncClient,
    *,
    horizon_days: int | None = None,
) -> ScanResult:
    """Poll one office/service pair and reconcile the result into ``slots``.

    Reconciliation is a full diff of the scan window rather than an append:
    an appointment that vanished between two scans is the normal case, and the
    app is only useful if it tracks disappearance as carefully as appearance.
    """
    provider = get_provider(office.provider)
    horizon = horizon_days if horizon_days is not None else settings.SCANNER_HORIZON_DAYS
    today = utcnow().date()
    window_end = today + timedelta(days=horizon)

    run = ScanRun(office_id=office.id, service_id=service.id, provider=str(office.provider))
    session.add(run)
    started = time.monotonic()

    # Checked per scan, not just at catalogue time: an authority can publish a
    # Disallow at any moment, and the catalogue flag is only as fresh as the
    # last person who looked. This is the backstop that makes the rule in
    # docs/legal.md structural instead of a matter of remembering it.
    verdict = await robots.allowed(client, office.base_url)
    if not verdict.allowed:
        # Only an actual prohibition takes the office out of the catalogue. An
        # unreadable robots.txt also stops this scan — it must — but it is
        # usually a brief outage, and striking the office out for it would
        # need a human to put it back.
        if verdict.prohibited:
            office.scan_enabled = False
            office.scan_blocked_reason = f"robots.txt: {office.base_url} verbietet automatisiertes Abrufen"
            log.warning("scanner.robots_disallowed", office=office.name, base_url=office.base_url)
        else:
            log.warning("scanner.robots_unreadable", office=office.name, base_url=office.base_url)
        run.status = ScanStatus.ERROR
        run.error = verdict.reason
        run.finished_at = utcnow()
        run.duration_ms = int((time.monotonic() - started) * 1000)
        await session.flush()
        return ScanResult(error=verdict.reason)

    try:
        raw_slots = await provider.fetch_slots(
            client, office_ref(office), service_ref(service), today, window_end
        )
    except (ProviderError, httpx.HTTPError) as exc:
        message = str(exc)[:900]
        run.status = ScanStatus.ERROR
        run.error = message
        run.finished_at = utcnow()
        run.duration_ms = int((time.monotonic() - started) * 1000)
        service.consecutive_failures += 1
        office.consecutive_failures += 1
        if office.consecutive_failures >= settings.SCANNER_FAILURE_THRESHOLD:
            # Back off from an authority that keeps erroring instead of
            # hammering it while it is down.
            office.cooldown_until = utcnow() + timedelta(seconds=settings.SCANNER_COOLDOWN_SECONDS)
            log.warning("scanner.office_cooldown", office=office.name, until=str(office.cooldown_until))
        service.next_scan_at = utcnow() + timedelta(
            seconds=provider.min_scan_interval_seconds * min(service.consecutive_failures, 6)
        )
        # Flushed here as well as on the happy path: a failed scan is exactly
        # the record worth having, and the caller may bail out before commit.
        await session.flush()
        log.warning("scanner.failed", office=office.name, service=service.name, error=message)
        return ScanResult(error=message)

    result = await _reconcile(session, office, service, raw_slots, window_end)

    now = utcnow()
    service.consecutive_failures = 0
    office.consecutive_failures = 0
    office.cooldown_until = None
    office.last_scanned_at = now
    service.last_scanned_at = now
    service.next_scan_at = now + timedelta(seconds=_interval_for(provider.min_scan_interval_seconds))

    run.status = ScanStatus.OK
    run.finished_at = now
    run.duration_ms = int((time.monotonic() - started) * 1000)
    run.slots_seen = result.seen
    run.slots_new = len(result.new_slot_ids)
    run.slots_gone = result.gone

    await session.flush()
    return result


def _interval_for(provider_minimum: int) -> int:
    """The slower of the provider's floor and the deployment's floor wins."""
    return max(provider_minimum, settings.SCANNER_MIN_INTERVAL_SECONDS)


async def _reconcile(
    session: AsyncSession,
    office: Office,
    service: Service,
    raw_slots: list,
    window_end: date,
) -> ScanResult:
    now = utcnow()
    known = (
        (
            await session.execute(
                select(Slot).where(
                    Slot.office_id == office.id,
                    Slot.service_id == service.id,
                    Slot.starts_at >= now,
                )
            )
        )
        .scalars()
        .all()
    )
    known_by_start = {slot.starts_at: slot for slot in known}

    result = ScanResult(seen=len(raw_slots))
    seen_starts: set = set()

    for raw in raw_slots:
        seen_starts.add(raw.starts_at)
        existing = known_by_start.get(raw.starts_at)
        if existing is None:
            slot = Slot(
                office_id=office.id,
                service_id=service.id,
                starts_at=raw.starts_at,
                ends_at=raw.ends_at,
                capacity=raw.capacity,
                provider_ref=raw.provider_ref,
                status=SlotStatus.AVAILABLE,
                first_seen_at=now,
                last_seen_at=now,
            )
            session.add(slot)
            await session.flush()
            # Registered here, not just in the pre-loaded map: a provider may
            # report the same start time twice in one response — two counters
            # free at 09:00, or simply a time rendered twice on the page. Without
            # this the second copy inserts again and the unique constraint on
            # (office, service, starts_at) aborts the whole scan cycle.
            known_by_start[raw.starts_at] = slot
            result.new_slot_ids.append(slot.id)
            continue

        existing.last_seen_at = now
        existing.capacity = raw.capacity
        if raw.provider_ref:
            existing.provider_ref = raw.provider_ref
        if existing.status == SlotStatus.GONE:
            # Somebody cancelled and the slot came back. That is worth an alert;
            # the unique (watch, slot) constraint decides whether the user has
            # already heard about this exact appointment.
            existing.status = SlotStatus.AVAILABLE
            existing.gone_at = None
            result.new_slot_ids.append(existing.id)

    for slot in known:
        if slot.starts_at in seen_starts or slot.status == SlotStatus.GONE:
            continue
        if slot.starts_at.date() > window_end:
            # Outside what this scan looked at, so its absence proves nothing.
            continue
        slot.status = SlotStatus.GONE
        slot.gone_at = now
        result.gone += 1

    return result


async def due_pairs(session: AsyncSession, *, limit: int = 50) -> list[tuple[Office, Service]]:
    """Office/service pairs that are watched by someone and due for a poll.

    Nothing is scanned speculatively: an office/service pair is only polled
    while at least one active watch is interested in it. That keeps request
    volume proportional to real demand rather than to catalogue size.
    """
    now = utcnow()
    watched_offices = (
        select(watch_offices.c.office_id)
        .join(Watch, Watch.id == watch_offices.c.watch_id)
        .where(
            Watch.active.is_(True),
            or_(Watch.paused_until.is_(None), Watch.paused_until <= now),
            or_(Watch.expires_at.is_(None), Watch.expires_at > now),
        )
    )
    watched_categories = select(Watch.category).where(Watch.active.is_(True))

    statement = (
        select(Service)
        .join(Office, Office.id == Service.office_id)
        .where(
            Service.active.is_(True),
            Office.active.is_(True),
            # Listed-but-not-scannable offices are filtered here rather than in
            # the adapter, so no adapter can accidentally poll one.
            Office.scan_enabled.is_(True),
            Service.office_id.in_(watched_offices),
            Service.category.in_(watched_categories),
            or_(Office.cooldown_until.is_(None), Office.cooldown_until <= now),
            or_(Service.next_scan_at.is_(None), Service.next_scan_at <= now),
        )
        .options(selectinload(Service.office))
        .order_by(Service.next_scan_at.is_(None).desc(), Service.next_scan_at)
        .limit(limit)
    )
    services = (await session.execute(statement)).scalars().all()
    return [(s.office, s) for s in services if is_enabled(s.office.provider)]


async def run_scan_cycle(session: AsyncSession, *, limit: int = 50) -> int:
    """One pass of the scheduler: poll what is due, alert on what is new."""
    pairs = await due_pairs(session, limit=limit)
    if not pairs:
        return 0

    all_new: list[uuid.UUID] = []
    async with build_client() as client:
        for office, service in pairs:
            result = await scan_pair(session, office, service, client)
            all_new.extend(result.new_slot_ids)

    if all_new:
        notification_ids = await alert_for_slots(session, all_new)
        await deliver_pending(session, notification_ids)

    await session.commit()
    log.info("scanner.cycle", pairs=len(pairs), new_slots=len(all_new))
    return len(pairs)


async def scan_loop(stop: asyncio.Event) -> None:
    """Long-running scanner driven by the app lifespan."""
    sessionmaker = get_sessionmaker()
    log.info("scanner.started", providers=settings.enabled_providers)
    while not stop.is_set():
        try:
            async with sessionmaker() as session:
                await run_scan_cycle(session)
        except Exception as exc:  # noqa: BLE001 - the loop must outlive any single failure
            log.error("scanner.cycle_failed", error=str(exc), exc_info=True)
        try:
            await asyncio.wait_for(stop.wait(), timeout=settings.SCANNER_TICK_SECONDS)
        except TimeoutError:
            continue
    log.info("scanner.stopped")
