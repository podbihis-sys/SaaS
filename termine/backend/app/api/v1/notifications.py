from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.core.errors import NotFound
from app.deps import CurrentUser, SessionDep
from app.models.base import utcnow
from app.models.notification import Notification
from app.schemas.watch import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    user: CurrentUser,
    session: SessionDep,
    unread_only: Annotated[bool, Query()] = False,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Notification]:
    """Alert history across all watches — the app's activity feed.

    Includes alerts that were suppressed by quiet hours or the rate limit, so
    the user can see what they missed and why the phone stayed quiet.
    """
    statement = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        statement = statement.where(Notification.read_at.is_(None))
    rows = (
        await session.execute(statement.order_by(Notification.created_at.desc()).limit(limit))
    ).scalars().all()
    return list(rows)


@router.post("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(notification_id: uuid.UUID, user: CurrentUser, session: SessionDep) -> Notification:
    notification = (
        await session.execute(
            select(Notification).where(
                Notification.id == notification_id, Notification.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if notification is None:
        raise NotFound("Notification not found")
    if notification.read_at is None:
        notification.read_at = utcnow()
        await session.flush()
    return notification
