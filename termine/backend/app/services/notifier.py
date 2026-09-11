from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.logging_config import get_logger
from app.models.base import utcnow
from app.models.enums import NotificationStatus
from app.models.notification import Notification
from app.models.user import Device

log = get_logger(__name__)

#: Expo accepts at most 100 messages per request.
_CHUNK_SIZE = 100

_WEEKDAYS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]


@dataclass(slots=True)
class PushMessage:
    to: str
    title: str
    body: str
    data: dict


def format_slot_datetime(starts_at: datetime, timezone: str) -> str:
    """`Di, 04.03. um 09:15 Uhr` — the shape a German reader scans fastest."""
    local = starts_at.astimezone(ZoneInfo(timezone))
    weekday = _WEEKDAYS_DE[local.weekday()]
    return f"{weekday}, {local.day:02d}.{local.month:02d}. um {local.hour:02d}:{local.minute:02d} Uhr"


def build_alert_text(
    *, service_name: str, office_name: str, city: str, starts_at: datetime, timezone: str
) -> tuple[str, str]:
    """Notification copy.

    The title carries the one fact that decides whether the user acts — when —
    because that is all a lock screen shows.
    """
    title = f"Termin frei: {format_slot_datetime(starts_at, timezone)}"
    body = f"{service_name} · {office_name}, {city}. Jetzt buchen, bevor der Termin weg ist."
    return title, body


async def _post_batch(client: httpx.AsyncClient, messages: list[PushMessage]) -> list[dict]:
    payload = [
        {"to": m.to, "title": m.title, "body": m.body, "data": m.data, "sound": "default", "priority": "high"}
        for m in messages
    ]
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if settings.EXPO_ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {settings.EXPO_ACCESS_TOKEN}"
    response = await client.post(settings.EXPO_PUSH_URL, json=payload, headers=headers)
    response.raise_for_status()
    body = response.json()
    tickets = body.get("data", [])
    return tickets if isinstance(tickets, list) else []


async def send_push(session: AsyncSession, messages: list[PushMessage]) -> dict[str, str]:
    """Deliver messages through Expo and retire tokens the service rejects.

    Returns a token -> outcome map (``"ok"`` or an Expo error code) so callers
    can record per-notification status.
    """
    if not messages:
        return {}
    if not settings.PUSH_ENABLED:
        log.info("push.disabled", count=len(messages))
        return {m.to: "disabled" for m in messages}

    outcomes: dict[str, str] = {}
    dead_tokens: list[str] = []

    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0)) as client:
        for start in range(0, len(messages), _CHUNK_SIZE):
            chunk = messages[start : start + _CHUNK_SIZE]
            try:
                tickets = await _post_batch(client, chunk)
            except httpx.HTTPError as exc:
                log.error("push.batch_failed", error=str(exc), count=len(chunk))
                for message in chunk:
                    outcomes[message.to] = "transport_error"
                continue

            for message, ticket in zip(chunk, tickets, strict=False):
                if ticket.get("status") == "ok":
                    outcomes[message.to] = "ok"
                    continue
                error_code = (ticket.get("details") or {}).get("error", "unknown")
                outcomes[message.to] = error_code
                if error_code == "DeviceNotRegistered":
                    dead_tokens.append(message.to)
                else:
                    log.warning("push.ticket_error", token=message.to[:24], error=error_code)

    if dead_tokens:
        # The user uninstalled or reset the app; keeping the token would mean
        # retrying a guaranteed failure on every future slot.
        await session.execute(
            update(Device)
            .where(Device.push_token.in_(dead_tokens))
            .values(active=False, invalidated_at=utcnow())
        )
        log.info("push.tokens_invalidated", count=len(dead_tokens))

    return outcomes


async def deliver_pending(session: AsyncSession, notification_ids: list) -> int:
    """Send every pending notification in the list and mark the outcome."""
    if not notification_ids:
        return 0

    notifications = (
        await session.execute(
            select(Notification).where(
                Notification.id.in_(notification_ids),
                Notification.status == NotificationStatus.PENDING,
            )
        )
    ).scalars().all()
    if not notifications:
        return 0

    user_ids = {n.user_id for n in notifications}
    devices = (
        await session.execute(
            select(Device).where(Device.user_id.in_(user_ids), Device.active.is_(True))
        )
    ).scalars().all()

    tokens_by_user: dict[object, list[str]] = {}
    for device in devices:
        tokens_by_user.setdefault(device.user_id, []).append(device.push_token)

    messages: list[PushMessage] = []
    message_owner: dict[str, list[Notification]] = {}
    for notification in notifications:
        tokens = tokens_by_user.get(notification.user_id, [])
        if not tokens:
            notification.status = NotificationStatus.FAILED
            notification.error = "no_active_device"
            continue
        for token in tokens:
            messages.append(
                PushMessage(
                    to=token,
                    title=notification.title,
                    body=notification.body,
                    data={
                        "notificationId": str(notification.id),
                        "watchId": str(notification.watch_id),
                        "slotId": str(notification.slot_id),
                        "type": "slot_available",
                    },
                )
            )
            message_owner.setdefault(token, []).append(notification)

    outcomes = await send_push(session, messages)

    sent = 0
    for token, owners in message_owner.items():
        outcome = outcomes.get(token, "unknown")
        for notification in owners:
            if notification.status != NotificationStatus.PENDING:
                continue
            if outcome in ("ok", "disabled"):
                notification.status = NotificationStatus.SENT
                notification.sent_at = utcnow()
                sent += 1
            else:
                notification.status = NotificationStatus.FAILED
                notification.error = outcome

    await session.flush()
    return sent
