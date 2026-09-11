"""The matcher decides whether a phone buzzes, so its edges are worth pinning."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, time, timedelta

import pytest

from app.models.enums import ServiceCategory
from app.models.watch import ALL_WEEKDAYS, Watch
from app.services.matcher import in_quiet_hours, slot_matches_watch, weekday_allowed

OFFICE_ID = uuid.uuid4()
OTHER_OFFICE_ID = uuid.uuid4()
NOW = datetime(2026, 3, 2, 8, 0, tzinfo=UTC)  # a Monday


class _Office:
    def __init__(self, office_id: uuid.UUID) -> None:
        self.id = office_id


def make_watch(**overrides: object) -> Watch:
    watch = Watch(
        label="Test",
        category=ServiceCategory.PERSONALAUSWEIS,
        weekday_mask=ALL_WEEKDAYS,
        min_lead_hours=2,
        active=True,
    )
    watch.offices = [_Office(OFFICE_ID)]  # type: ignore[assignment]
    for key, value in overrides.items():
        setattr(watch, key, value)
    return watch


def check(watch: Watch, starts_at: datetime, **overrides: object) -> bool:
    kwargs = {
        "watch": watch,
        "category": ServiceCategory.PERSONALAUSWEIS,
        "office_id": OFFICE_ID,
        "starts_at": starts_at,
        "office_timezone": "Europe/Berlin",
        "now": NOW,
    }
    kwargs.update(overrides)
    return slot_matches_watch(**kwargs)  # type: ignore[arg-type]


def test_matches_a_plain_slot() -> None:
    assert check(make_watch(), NOW + timedelta(days=1))


def test_rejects_other_category() -> None:
    assert not check(make_watch(), NOW + timedelta(days=1), category=ServiceCategory.REISEPASS)


def test_rejects_office_not_on_the_watch() -> None:
    assert not check(make_watch(), NOW + timedelta(days=1), office_id=OTHER_OFFICE_ID)


def test_rejects_inactive_and_paused_and_expired() -> None:
    later = NOW + timedelta(days=1)
    assert not check(make_watch(active=False), later)
    assert not check(make_watch(paused_until=NOW + timedelta(hours=3)), later)
    assert not check(make_watch(expires_at=NOW - timedelta(minutes=1)), later)
    # A pause that has already lapsed must not keep suppressing matches.
    assert check(make_watch(paused_until=NOW - timedelta(hours=1)), later)


def test_min_lead_hours_excludes_imminent_slots() -> None:
    watch = make_watch(min_lead_hours=4)
    assert not check(watch, NOW + timedelta(hours=3))
    assert check(watch, NOW + timedelta(hours=5))


def test_date_window_is_inclusive() -> None:
    watch = make_watch(earliest_date=date(2026, 3, 4), latest_date=date(2026, 3, 6))
    assert not check(watch, datetime(2026, 3, 3, 10, tzinfo=UTC))
    assert check(watch, datetime(2026, 3, 4, 10, tzinfo=UTC))
    assert check(watch, datetime(2026, 3, 6, 10, tzinfo=UTC))
    assert not check(watch, datetime(2026, 3, 7, 10, tzinfo=UTC))


def test_weekday_mask_uses_local_day() -> None:
    # 22:30 UTC on Tuesday is 23:30 Tuesday in Berlin (CET, +1 in March 3rd week
    # is still winter time), so a Tuesday-only watch must accept it.
    tuesday_only = make_watch(weekday_mask=1 << 1)
    assert check(tuesday_only, datetime(2026, 3, 3, 22, 30, tzinfo=UTC))
    assert not check(tuesday_only, datetime(2026, 3, 4, 10, 0, tzinfo=UTC))


def test_time_window_uses_office_local_time() -> None:
    """08:30 UTC is 09:30 in Berlin, which is inside an 09:00-12:00 window."""
    watch = make_watch(earliest_time=time(9, 0), latest_time=time(12, 0))
    assert check(watch, datetime(2026, 3, 4, 8, 30, tzinfo=UTC))
    assert not check(watch, datetime(2026, 3, 4, 7, 30, tzinfo=UTC))
    assert not check(watch, datetime(2026, 3, 4, 12, 30, tzinfo=UTC))


def test_open_ended_time_window() -> None:
    after_nine = make_watch(earliest_time=time(9, 0))
    assert check(after_nine, datetime(2026, 3, 4, 15, 0, tzinfo=UTC))
    assert not check(after_nine, datetime(2026, 3, 4, 6, 0, tzinfo=UTC))


@pytest.mark.parametrize(
    ("mask", "weekday", "expected"),
    [
        (ALL_WEEKDAYS, 0, True),
        (ALL_WEEKDAYS, 6, True),
        (0b0011111, 5, False),  # weekdays only, Saturday rejected
        (0b0011111, 4, True),
        (1 << 3, 3, True),
        (1 << 3, 2, False),
    ],
)
def test_weekday_allowed(mask: int, weekday: int, expected: bool) -> None:
    assert weekday_allowed(mask, weekday) is expected


def test_quiet_hours_wrapping_midnight() -> None:
    watch = make_watch(quiet_hours_start=time(22, 0), quiet_hours_end=time(7, 0))
    # 02:00 Berlin is inside 22:00-07:00.
    assert in_quiet_hours(watch, datetime(2026, 3, 4, 1, 0, tzinfo=UTC))
    # 13:00 Berlin is not.
    assert not in_quiet_hours(watch, datetime(2026, 3, 4, 12, 0, tzinfo=UTC))


def test_quiet_hours_within_one_day() -> None:
    watch = make_watch(quiet_hours_start=time(13, 0), quiet_hours_end=time(14, 0))
    assert in_quiet_hours(watch, datetime(2026, 3, 4, 12, 30, tzinfo=UTC))
    assert not in_quiet_hours(watch, datetime(2026, 3, 4, 14, 30, tzinfo=UTC))


def test_no_quiet_hours_configured() -> None:
    assert not in_quiet_hours(make_watch(), NOW)
