from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db_types import GUID, JSONType
from app.models.base import Base, TenantMixin, TimestampMixin, primary_key


class AIAnalysis(Base, TimestampMixin, TenantMixin):
    __tablename__ = "ai_analyses"

    id: Mapped[uuid.UUID] = primary_key()
    company_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    result: Mapped[dict[str, Any]] = mapped_column(JSONType(), nullable=False)
    raw_response: Mapped[dict[str, Any] | None] = mapped_column(JSONType(), nullable=True)

    inquiry: Mapped["Inquiry"] = relationship(back_populates="analyses")  # noqa: F821
