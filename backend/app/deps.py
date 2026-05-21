from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from dataclasses import dataclass

from fastapi import Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import Forbidden, Unauthorized
from app.database import get_sessionmaker
from app.logging_config import company_id_ctx, user_id_ctx
from app.models.user import User
from app.security import JWTClaims, extract_bearer, verify_token
from app.services.auth_service import AuthService


async def get_db() -> AsyncIterator[AsyncSession]:
    sm = get_sessionmaker()
    async with sm() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_claims(authorization: str | None = Header(default=None)) -> JWTClaims:
    token = extract_bearer(authorization)
    return verify_token(token)


@dataclass(frozen=True, slots=True)
class CurrentUser:
    id: uuid.UUID
    email: str
    claims: JWTClaims


async def get_current_user(
    claims: JWTClaims = Depends(get_claims),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    service = AuthService(db)
    user: User = await service.upsert_user_from_claims(claims)
    token = user_id_ctx.set(str(user.id))
    _ = token
    return CurrentUser(id=user.id, email=user.email, claims=claims)


async def get_current_company_id(
    request: Request,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_company_id: str | None = Header(default=None, alias="X-Company-Id"),
) -> uuid.UUID:
    service = AuthService(db)
    memberships = await service.list_active_memberships(user.id)
    if not memberships:
        raise Forbidden("No active membership for user")

    if x_company_id:
        try:
            requested = uuid.UUID(x_company_id)
        except ValueError as e:
            raise Unauthorized("Invalid X-Company-Id header") from e
        if not any(m.company_id == requested for m in memberships):
            raise Forbidden("User is not a member of the requested company")
        active = requested
    else:
        active = memberships[0].company_id

    company_id_ctx.set(str(active))
    request.state.company_id = active
    return active
