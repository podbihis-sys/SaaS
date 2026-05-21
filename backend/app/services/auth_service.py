from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.membership import Membership
from app.models.user import User
from app.repositories.company_repo import CompanyRepository
from app.security import JWTClaims


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.companies = CompanyRepository(db)

    async def upsert_user_from_claims(self, claims: JWTClaims) -> User:
        try:
            user_id = uuid.UUID(claims.sub)
        except ValueError:
            user_id = uuid.uuid5(uuid.NAMESPACE_URL, f"supabase:{claims.sub}")

        user = await self.db.get(User, user_id)
        if user is None:
            email = claims.email or f"{user_id}@unknown.local"
            full_name = claims.raw.get("user_metadata", {}).get("full_name") if isinstance(
                claims.raw.get("user_metadata"), dict
            ) else None
            user = User(id=user_id, email=email, full_name=full_name)
            self.db.add(user)
            await self.db.flush()
        elif claims.email and user.email != claims.email:
            user.email = claims.email
            await self.db.flush()
        return user

    async def list_active_memberships(self, user_id: uuid.UUID) -> list[Membership]:
        return await self.companies.list_memberships_for_user(user_id)
