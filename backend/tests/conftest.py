from __future__ import annotations

import os
import uuid
from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

os.environ.setdefault("ENV", "test")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-secret-for-pytest-only")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("DATABASE_URL", os.environ.get("TEST_DATABASE_URL", "sqlite+aiosqlite:///:memory:"))

from app.config import get_settings  # noqa: E402,I001

get_settings.cache_clear()

from app.database import get_sessionmaker, reset_engine_for_tests  # noqa: E402,I001
from app.deps import (  # noqa: E402,I001
    CurrentUser,
    get_current_company_id,
    get_current_user,
    get_db,
)
from app.main import app  # noqa: E402,I001
from app.models import Base  # noqa: E402,I001
from app.models.company import Company  # noqa: E402,I001
from app.models.membership import Membership, MembershipRole  # noqa: E402,I001
from app.models.settings import CompanySettings  # noqa: E402,I001
from app.models.user import User  # noqa: E402,I001


def _resolve_test_db_url() -> str:
    return os.environ.get("TEST_DATABASE_URL") or "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def db_engine() -> AsyncIterator[None]:
    reset_engine_for_tests(_resolve_test_db_url())
    sm = get_sessionmaker()
    engine = sm.kw["bind"]
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    try:
        yield
    finally:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine: None) -> AsyncIterator[AsyncSession]:
    sm = get_sessionmaker()
    async with sm() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def two_companies(db_engine: None) -> AsyncIterator[dict[str, object]]:
    sm = get_sessionmaker()
    async with sm() as session:
        user_a = User(id=uuid.uuid4(), email="a@example.com", full_name="User A")
        user_b = User(id=uuid.uuid4(), email="b@example.com", full_name="User B")
        comp_a = Company(name="Alpha Bau", slug="alpha-bau")
        comp_b = Company(name="Beta Bau", slug="beta-bau")
        session.add_all([user_a, user_b, comp_a, comp_b])
        await session.flush()
        session.add_all(
            [
                Membership(company_id=comp_a.id, user_id=user_a.id, role=MembershipRole.OWNER),
                Membership(company_id=comp_b.id, user_id=user_b.id, role=MembershipRole.OWNER),
                CompanySettings(company_id=comp_a.id),
                CompanySettings(company_id=comp_b.id),
            ]
        )
        await session.commit()
        yield {
            "user_a_id": user_a.id,
            "user_b_id": user_b.id,
            "company_a_id": comp_a.id,
            "company_b_id": comp_b.id,
        }


@pytest_asyncio.fixture
async def client_factory(db_engine: None):
    def _make(user_id: uuid.UUID, company_id: uuid.UUID) -> AsyncClient:
        async def _get_db_override() -> AsyncIterator[AsyncSession]:
            sm = get_sessionmaker()
            async with sm() as session:
                try:
                    yield session
                    await session.commit()
                except Exception:
                    await session.rollback()
                    raise

        async def _get_user_override() -> CurrentUser:
            from app.security import JWTClaims

            return CurrentUser(
                id=user_id, email="test@example.com",
                claims=JWTClaims(sub=str(user_id), email="test@example.com", raw={}),
            )

        async def _get_cid_override() -> uuid.UUID:
            from app.logging_config import company_id_ctx

            company_id_ctx.set(str(company_id))
            return company_id

        app.dependency_overrides[get_db] = _get_db_override
        app.dependency_overrides[get_current_user] = _get_user_override
        app.dependency_overrides[get_current_company_id] = _get_cid_override

        return AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
            headers={"Authorization": "Bearer faketoken"},
        )

    yield _make
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def _reset_overrides():
    yield
    app.dependency_overrides.clear()
