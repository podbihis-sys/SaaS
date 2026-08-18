from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter
from sqlalchemy import func, select

from app.config import settings
from app.deps import SessionDep
from app.models.base import utcnow
from app.models.enums import ScanStatus, SlotStatus
from app.models.office import Office
from app.models.slot import ScanRun, Slot

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    return {"status": "ok", "env": settings.ENV}


@router.get("/health/scanner")
async def scanner_health(session: SessionDep) -> dict:
    """Whether the scanner is actually finding things.

    A scanner that runs happily but has stopped parsing anything looks healthy
    from the outside, so the error rate over the last hour is reported next to
    the raw liveness signal.
    """
    since = utcnow() - timedelta(hours=1)
    total = await session.scalar(
        select(func.count()).select_from(ScanRun).where(ScanRun.started_at >= since)
    )
    failed = await session.scalar(
        select(func.count())
        .select_from(ScanRun)
        .where(ScanRun.started_at >= since, ScanRun.status == ScanStatus.ERROR)
    )
    last_run = await session.scalar(select(func.max(ScanRun.started_at)))
    available = await session.scalar(
        select(func.count())
        .select_from(Slot)
        .where(Slot.status == SlotStatus.AVAILABLE, Slot.starts_at >= utcnow())
    )
    offices = await session.scalar(
        select(func.count()).select_from(Office).where(Office.active.is_(True))
    )

    return {
        "enabled": settings.SCANNER_ENABLED,
        "providers": settings.enabled_providers,
        "runs_last_hour": total or 0,
        "failures_last_hour": failed or 0,
        "last_run_at": last_run.isoformat() if last_run else None,
        "available_slots": available or 0,
        "active_offices": offices or 0,
    }
