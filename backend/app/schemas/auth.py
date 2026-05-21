from __future__ import annotations

import uuid

from pydantic import BaseModel, EmailStr

from app.models.membership import MembershipRole
from app.schemas.common import ORMModel


class UserRead(ORMModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None


class MembershipRead(ORMModel):
    id: uuid.UUID
    company_id: uuid.UUID
    role: MembershipRole
    is_active: bool


class CompanySummary(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    role: MembershipRole


class MeResponse(BaseModel):
    user: UserRead
    memberships: list[MembershipRead]
    companies: list[CompanySummary]
    active_company_id: uuid.UUID | None = None
