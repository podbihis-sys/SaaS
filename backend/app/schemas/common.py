from __future__ import annotations

from datetime import datetime
from typing import TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TimestampedRead(ORMModel):
    created_at: datetime
    updated_at: datetime


class Message(BaseModel):
    message: str


class ProblemDetail(BaseModel):
    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None
    code: str
    request_id: str | None = None
    errors: list[dict[str, object]] | None = None


class PageMeta(BaseModel):
    total: int
    page: int
    page_size: int


class Paged[T](BaseModel):
    items: list[T]
    meta: PageMeta
