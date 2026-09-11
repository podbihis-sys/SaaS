from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.ids import new_id
from app.db_types import GUID, UTCDateTime


def utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        UTCDateTime(), default=utcnow, onupdate=utcnow, nullable=False
    )


def primary_key() -> Mapped[uuid.UUID]:
    return mapped_column(GUID(), primary_key=True, default=new_id)
