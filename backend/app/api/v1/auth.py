from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import CurrentUser, get_current_user, get_db
from app.models.user import User
from app.schemas.auth import MeResponse, MembershipRead, UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=MeResponse)
async def me(
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_company_id: str | None = Header(default=None, alias="X-Company-Id"),
) -> MeResponse:
    service = AuthService(db)
    memberships = await service.list_active_memberships(user.id)

    active_company: uuid.UUID | None = None
    if x_company_id:
        try:
            requested = uuid.UUID(x_company_id)
            if any(m.company_id == requested for m in memberships):
                active_company = requested
        except ValueError:
            active_company = None
    if active_company is None and memberships:
        active_company = memberships[0].company_id

    user_row = await db.get(User, user.id)
    assert user_row is not None
    return MeResponse(
        user=UserRead.model_validate(user_row),
        memberships=[MembershipRead.model_validate(m) for m in memberships],
        active_company_id=active_company,
    )
