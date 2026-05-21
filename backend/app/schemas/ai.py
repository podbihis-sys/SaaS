from __future__ import annotations

import uuid

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel, TimestampedRead


class DetectedService(BaseModel):
    key: str = Field(description="Service key matching price catalog entries (e.g. 'paint_wall')")
    label: str
    unit: str = Field(description="qm, h, stk, pauschal, etc.")
    quantity_estimate: float = Field(ge=0)
    confidence: float = Field(ge=0.0, le=1.0)


class AIAnalysisResult(BaseModel):
    rooms: list[str] = []
    materials: list[str] = []
    damages: list[str] = []
    detected_services: list[DetectedService] = []
    notes: str | None = None


class AnalyzeRequest(ORMModel):
    inquiry_id: uuid.UUID


class AIAnalysisRead(TimestampedRead):
    id: uuid.UUID
    inquiry_id: uuid.UUID
    model: str
    result: AIAnalysisResult
