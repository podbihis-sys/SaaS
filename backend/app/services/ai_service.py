from __future__ import annotations

import json
from typing import Any

from app.config import settings
from app.core.errors import ExternalServiceError
from app.logging_config import get_logger
from app.schemas.ai import AIAnalysisResult

logger = get_logger(__name__)


SYSTEM_PROMPT = (
    "Du bist ein Assistent fuer deutsche Handwerksbetriebe. Analysiere Kundenanfragen "
    "und Bilder und identifiziere benoetigte Leistungen, Raeume, Materialien und "
    "Schaeden. Antworte ausschliesslich in strukturiertem JSON gemaess Schema. "
    "WICHTIG: Gib niemals Preise, Stundensaetze oder Kosten an. Schaetze nur Mengen "
    "(Quadratmeter, Stunden, Stueck). Halte detected_services.key kurz, "
    "snake_case, z.B. 'paint_wall', 'tile_floor', 'plaster_repair'."
)

RESPONSE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["rooms", "materials", "damages", "detected_services", "notes"],
    "properties": {
        "rooms": {"type": "array", "items": {"type": "string"}},
        "materials": {"type": "array", "items": {"type": "string"}},
        "damages": {"type": "array", "items": {"type": "string"}},
        "detected_services": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["key", "label", "unit", "quantity_estimate", "confidence"],
                "properties": {
                    "key": {"type": "string"},
                    "label": {"type": "string"},
                    "unit": {"type": "string"},
                    "quantity_estimate": {"type": "number", "minimum": 0},
                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                },
            },
        },
        "notes": {"type": ["string", "null"]},
    },
}


class AIService:
    def __init__(self, model: str | None = None, api_key: str | None = None) -> None:
        self.model = model or settings.OPENAI_MODEL
        self.api_key = api_key or settings.OPENAI_API_KEY

    async def analyze_inquiry(
        self,
        text: str | None,
        image_urls: list[str],
    ) -> AIAnalysisResult:
        if not self.api_key:
            raise ExternalServiceError("OPENAI_API_KEY is not configured")

        try:
            from openai import AsyncOpenAI
        except ImportError as e:
            raise ExternalServiceError("openai package not installed") from e

        client = AsyncOpenAI(api_key=self.api_key)

        user_content: list[dict[str, Any]] = []
        prompt_text = text or "Bitte analysiere die beigefuegten Bilder."
        user_content.append({"type": "input_text", "text": prompt_text})
        for url in image_urls:
            user_content.append({"type": "input_image", "image_url": url})

        try:
            response = await client.responses.create(
                model=self.model,
                input=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "inquiry_analysis",
                        "strict": True,
                        "schema": RESPONSE_SCHEMA,
                    },
                },
            )
        except Exception as e:
            logger.error("openai_responses_failed", error=str(e))
            raise ExternalServiceError(f"OpenAI API error: {e}") from e

        raw = self._extract_output_text(response)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as e:
            raise ExternalServiceError(f"OpenAI returned invalid JSON: {e}") from e

        return AIAnalysisResult.model_validate(data)

    @staticmethod
    def _extract_output_text(response: Any) -> str:
        text = getattr(response, "output_text", None)
        if text:
            return str(text)
        output = getattr(response, "output", None)
        if isinstance(output, list):
            for item in output:
                content = getattr(item, "content", None)
                if isinstance(content, list):
                    for part in content:
                        t = getattr(part, "text", None)
                        if t:
                            return str(t)
        raise ExternalServiceError("OpenAI response had no textual output")
