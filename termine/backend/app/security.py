from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt

from app.config import settings
from app.core.errors import Unauthorized


def issue_token(user_id: uuid.UUID) -> tuple[str, datetime]:
    """Mint a long-lived device token.

    The app has no password to re-enter, so the token has to survive a phone
    sitting in a drawer for months. It carries nothing but the user id.
    """
    expires_at = datetime.now(UTC) + timedelta(days=settings.JWT_TTL_DAYS)
    payload = {
        "sub": str(user_id),
        "iss": settings.JWT_ISSUER,
        "iat": int(datetime.now(UTC).timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token, expires_at


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError as exc:
        raise Unauthorized("Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise Unauthorized("Invalid token") from exc


def user_id_from_token(token: str) -> uuid.UUID:
    payload = decode_token(token)
    try:
        return uuid.UUID(str(payload["sub"]))
    except (KeyError, ValueError) as exc:
        raise Unauthorized("Token subject is not a user id") from exc
