from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Unauthorized
from app.database import get_session
from app.logging_config import user_id_ctx
from app.models.base import utcnow
from app.models.user import User
from app.security import user_id_from_token

SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_current_user(
    session: SessionDep,
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise Unauthorized("Missing bearer token")
    user_id = user_id_from_token(authorization.split(" ", 1)[1].strip())

    user = await session.get(User, user_id)
    if user is None or not user.active:
        raise Unauthorized("Unknown or disabled account")

    user_id_ctx.set(str(user.id))
    user.last_seen_at = utcnow()
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
