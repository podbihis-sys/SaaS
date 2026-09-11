from __future__ import annotations

from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from app.models.enums import ServiceCategory
from app.models.watch import Watch


def weekday_allowed(mask: int, weekday: int) -> bool:
    """``weekday`` is ``date.weekday()``: Monday is 0."""
    return bool(mask & (1 << weekday))


def _in_time_window(value: time, start: time | None, end: time | None) -> bool:
    if start is None and end is None:
        return True
    if start is not None and end is not None and start > end:
        # Window wraps past midnight, e.g. 22:00 -> 06:00.
        return value >= start or value <= end
    if start is not None and value < start:
        return False
    return end is None or value <= end


def slot_matches_watch(
    *,
    watch: Watch,
    category: ServiceCategory,
    office_id: object,
    starts_at: datetime,
    office_timezone: str,
    now: datetime,
) -> bool:
    """Whether one observed slot is worth telling this watch about.

    All of the user's constraints are expressed in the office's local time,
    because "Dienstagvormittag" means the morning where the appointment is, not
    wherever the server happens to run.
    """
    if not watch.active:
        return False
    if watch.paused_until and watch.paused_until > now:
        return False
    if watch.expires_at and watch.expires_at <= now:
        return False
    if category != watch.category:
        return False
    if office_id not in {office.id for office in watch.offices}:
        return False

    # You cannot be at the Amt in ten minutes.
    if starts_at < now + timedelta(hours=watch.min_lead_hours):
        return False

    local = starts_at.astimezone(ZoneInfo(office_timezone))
    local_date = local.date()

    if watch.earliest_date and local_date < watch.earliest_date:
        return False
    if watch.latest_date and local_date > watch.latest_date:
        return False
    if not weekday_allowed(watch.weekday_mask, local_date.weekday()):
        return False
    return _in_time_window(local.time(), watch.earliest_time, watch.latest_time)


def in_quiet_hours(watch: Watch, now: datetime, timezone: str = "Europe/Berlin") -> bool:
    """Whether a push right now would land in the user's do-not-disturb window."""
    if watch.quiet_hours_start is None or watch.quiet_hours_end is None:
        return False
    local_time = now.astimezone(ZoneInfo(timezone)).time()
    start, end = watch.quiet_hours_start, watch.quiet_hours_end
    if start <= end:
        return start <= local_time <= end
    return local_time >= start or local_time <= end
