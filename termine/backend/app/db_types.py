from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import CHAR, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.engine import Dialect
from sqlalchemy.types import JSON, TypeDecorator


class GUID(TypeDecorator[uuid.UUID]):
    """Portable UUID type: native UUID on Postgres, CHAR(36) elsewhere."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect) -> Any:
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value: Any, dialect: Dialect) -> Any:
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
        return str(value) if isinstance(value, uuid.UUID) else str(uuid.UUID(str(value)))

    def process_result_value(self, value: Any, dialect: Dialect) -> uuid.UUID | None:
        if value is None:
            return None
        return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))


class UTCDateTime(TypeDecorator[datetime]):
    """Timestamps that are always timezone-aware UTC, on every backend.

    Postgres round-trips ``timestamptz`` faithfully; SQLite has no timezone
    concept and hands back naive values. Every comparison in this service —
    "is this slot far enough in the future", "was this scanned recently" —
    would then behave differently under test than in production, and the
    failure mode is a ``TypeError`` deep inside the matcher rather than
    anything obvious. So conversion happens once, here: naive values are
    treated as UTC going in, and everything comes back aware.
    """

    impl = DateTime
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect) -> Any:
        return dialect.type_descriptor(DateTime(timezone=True))

    def process_bind_param(self, value: Any, dialect: Dialect) -> Any:
        if value is None:
            return None
        if not isinstance(value, datetime):
            return value
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)

    def process_result_value(self, value: Any, dialect: Dialect) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)


class JSONType(TypeDecorator[Any]):
    """Portable JSON type: JSONB on Postgres, JSON elsewhere."""

    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect) -> Any:
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(JSON())
