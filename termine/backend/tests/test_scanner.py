"""Reconciliation is what turns a stateless scrape into a slot lifecycle."""

from __future__ import annotations

from datetime import timedelta

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ProviderError
from app.models import Office, Service, Slot
from app.models.base import utcnow
from app.models.enums import ScanStatus, SlotStatus
from app.models.slot import ScanRun
from app.providers.base import RawSlot
from app.services import scanner as scanner_module
from app.services.scanner import scan_pair


class StubProvider:
    """Returns a scripted list of slots, standing in for a booking system."""

    key = "demo"
    display_name = "stub"
    min_scan_interval_seconds = 60

    def __init__(self, batches: list[list[RawSlot] | Exception]) -> None:
        self.batches = batches
        self.calls = 0

    async def fetch_slots(self, client, office, service, date_from, date_to):  # noqa: ANN001
        batch = self.batches[min(self.calls, len(self.batches) - 1)]
        self.calls += 1
        if isinstance(batch, Exception):
            raise batch
        return batch


@pytest.fixture
def stub(monkeypatch: pytest.MonkeyPatch):  # noqa: ANN201
    holder: dict[str, StubProvider] = {}

    def install(batches: list[list[RawSlot] | Exception]) -> StubProvider:
        provider = StubProvider(batches)
        holder["provider"] = provider
        monkeypatch.setattr(scanner_module, "get_provider", lambda _key: provider)
        return provider

    return install


def raw(hours_ahead: int, ref: str | None = None) -> RawSlot:
    starts = utcnow().replace(microsecond=0) + timedelta(hours=hours_ahead)
    return RawSlot(starts_at=starts, ends_at=starts + timedelta(minutes=15), provider_ref=ref)


async def run(session: AsyncSession, office: Office, service: Service):  # noqa: ANN201
    async with httpx.AsyncClient() as client:
        return await scan_pair(session, office, service, client)


async def test_first_scan_records_every_slot_as_new(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    stub([[raw(24), raw(48)]])
    result = await run(session, office, service)

    assert result.ok
    assert result.seen == 2
    assert len(result.new_slot_ids) == 2
    assert result.gone == 0


async def test_unchanged_slot_is_not_reported_new_again(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    """Otherwise every scan would re-alert every user about the same slot."""
    batch = [raw(24)]
    stub([batch, batch])

    first = await run(session, office, service)
    service.next_scan_at = None
    second = await run(session, office, service)

    assert len(first.new_slot_ids) == 1
    assert second.new_slot_ids == []
    assert second.seen == 1


async def test_vanished_slot_is_marked_gone(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    stub([[raw(24), raw(48)], [raw(24)]])

    await run(session, office, service)
    result = await run(session, office, service)

    assert result.gone == 1
    gone = (
        await session.execute(select(Slot).where(Slot.status == SlotStatus.GONE))
    ).scalars().all()
    assert len(gone) == 1
    assert gone[0].gone_at is not None


async def test_returning_slot_is_new_again(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    """A cancellation puts a slot back on the market; that is worth an alert."""
    slot = raw(24)
    stub([[slot], [], [slot]])

    await run(session, office, service)
    await run(session, office, service)
    result = await run(session, office, service)

    assert len(result.new_slot_ids) == 1
    restored = await session.get(Slot, result.new_slot_ids[0])
    assert restored is not None
    assert restored.status == SlotStatus.AVAILABLE
    assert restored.gone_at is None


async def test_provider_failure_is_recorded_and_backs_off(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    stub([ProviderError("calendar page had no recognisable structure")])
    before = utcnow()

    result = await run(session, office, service)

    assert not result.ok
    assert service.consecutive_failures == 1
    assert service.next_scan_at is not None and service.next_scan_at > before

    run_row = (await session.execute(select(ScanRun))).scalars().one()
    assert run_row.status == ScanStatus.ERROR
    assert "recognisable" in (run_row.error or "")


async def test_failure_does_not_mark_existing_slots_gone(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    """A broken scrape must not look like "everything got booked"."""
    stub([[raw(24)], ProviderError("upstream down")])

    await run(session, office, service)
    await run(session, office, service)

    slots = (await session.execute(select(Slot))).scalars().all()
    assert [s.status for s in slots] == [SlotStatus.AVAILABLE]


async def test_repeated_failures_put_the_office_in_cooldown(
    session: AsyncSession, office: Office, service: Service, stub, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(scanner_module.settings, "SCANNER_FAILURE_THRESHOLD", 2)
    stub([ProviderError("boom")])

    await run(session, office, service)
    assert office.cooldown_until is None
    await run(session, office, service)
    assert office.cooldown_until is not None


async def test_success_clears_failure_state(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    stub([ProviderError("boom"), [raw(24)]])

    await run(session, office, service)
    service.next_scan_at = None
    await run(session, office, service)

    assert service.consecutive_failures == 0
    assert office.consecutive_failures == 0
    assert office.cooldown_until is None
    assert service.last_scanned_at is not None


async def test_provider_ref_is_refreshed(
    session: AsyncSession, office: Office, service: Service, stub
) -> None:
    """Booking tokens rotate; the stored one has to follow."""
    stub([[raw(24, "token-1")], [raw(24, "token-2")]])

    await run(session, office, service)
    await run(session, office, service)

    slot = (await session.execute(select(Slot))).scalars().one()
    assert slot.provider_ref == "token-2"
