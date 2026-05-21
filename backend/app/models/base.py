from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, event
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.errors import TenantMismatch
from app.core.ids import new_id
from app.db_types import GUID
from app.logging_config import company_id_ctx


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )


class TenantMixin:
    """Mixin marking a model as tenant-owned. All such models MUST set company_id."""

    @classmethod
    def __declare_last__(cls) -> None:
        pass


def _make_company_fk() -> Mapped[uuid.UUID]:
    return mapped_column(
        GUID(),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


@event.listens_for(Base.metadata, "before_create")
def _noop_before_create(target, connection, **kw):  # type: ignore[no-untyped-def]
    return None


def _tenant_guard(_mapper, _connection, target: object) -> None:
    if not isinstance(target, TenantMixin):
        return
    obj_cid = getattr(target, "company_id", None)
    if obj_cid is None:
        raise TenantMismatch("Tenant-scoped row missing company_id")
    ctx = company_id_ctx.get()
    if ctx is None:
        return
    if str(obj_cid) != str(ctx):
        raise TenantMismatch(
            f"Row company_id {obj_cid} does not match request context {ctx}"
        )


def install_tenant_guard() -> None:
    """Register SQLAlchemy guards on all current TenantMixin mappers."""
    from sqlalchemy.orm import Mapper, mapperlib  # noqa: F401

    for mapper in Base.registry.mappers:
        cls = mapper.class_
        if issubclass(cls, TenantMixin):
            event.listen(cls, "before_insert", _tenant_guard, propagate=True)
            event.listen(cls, "before_update", _tenant_guard, propagate=True)


def primary_key() -> Mapped[uuid.UUID]:
    return mapped_column(GUID(), primary_key=True, default=new_id)
