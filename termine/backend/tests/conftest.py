from __future__ import annotations

import os
from collections.abc import AsyncIterator

os.environ.setdefault("ENV", "test")
os.environ.setdefault("JWT_SECRET", "test-secret-that-is-comfortably-long-enough")
os.environ.setdefault("PUSH_ENABLED", "false")
os.environ.setdefault("SCANNER_ENABLED", "false")
os.environ.setdefault("SCANNER_PROVIDERS", "demo")
os.environ.setdefault("OPENPLZ_ENABLED", "false")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session, get_sessionmaker, reset_engine_for_tests
from app.main import app
from app.models import Base, Office, Service, User
from app.models.enums import AuthorityType, Provider, ServiceCategory
from app.security import issue_token

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL", "sqlite+aiosqlite:///:memory:")


@pytest.fixture(autouse=True)
async def _database() -> AsyncIterator[None]:
    """A fresh schema per test.

    A shared in-memory SQLite database keeps every connection in the same
    store, so the app's sessions and the test's own session see the same rows.
    """
    reset_engine_for_tests("sqlite+aiosqlite:///file:testdb?mode=memory&cache=shared&uri=true")
    from app.database import get_engine

    engine = get_engine()
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def session() -> AsyncIterator[AsyncSession]:
    """One session shared by the test and by the app under test.

    Requests are served from the same transaction the test writes into, so
    fixture rows are visible to the API without committing them first, and a
    row the API creates can be inspected directly afterwards.
    """
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as db:

        async def _override() -> AsyncIterator[AsyncSession]:
            yield db

        app.dependency_overrides[get_session] = _override
        try:
            yield db
        finally:
            app.dependency_overrides.pop(get_session, None)
            await db.rollback()


@pytest.fixture
async def client(session: AsyncSession) -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http:
        yield http


@pytest.fixture
async def office(session: AsyncSession) -> Office:
    row = Office(
        provider=Provider.DEMO,
        external_id="demo-test-office",
        base_url="https://demo.invalid",
        name="Bürgeramt Testhausen",
        authority_type=AuthorityType.BUERGERAMT,
        city="Testhausen",
        postal_code="12345",
        latitude=52.5,
        longitude=13.4,
        booking_url="https://demo.invalid/termine",
    )
    session.add(row)
    await session.flush()
    return row


@pytest.fixture
async def service(session: AsyncSession, office: Office) -> Service:
    row = Service(
        office_id=office.id,
        external_id="demo-perso",
        name="Personalausweis beantragen",
        category=ServiceCategory.PERSONALAUSWEIS,
        duration_minutes=20,
    )
    session.add(row)
    await session.flush()
    return row


@pytest.fixture
async def user(session: AsyncSession) -> User:
    row = User(install_id="test-install-0001")
    session.add(row)
    await session.flush()
    return row


@pytest.fixture
def auth_headers(user: User) -> dict[str, str]:
    token, _ = issue_token(user.id)
    return {"Authorization": f"Bearer {token}"}
