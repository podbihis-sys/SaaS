from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    ENV: Literal["dev", "staging", "prod", "test"] = "dev"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/handwerk"
    TEST_DATABASE_URL: str | None = None

    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_JWT_JWKS_URL: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    SUPABASE_STORAGE_BUCKET: str = "inquiry-images"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    DEFAULT_VAT_RATE: float = 0.19
    DEFAULT_CURRENCY: str = "EUR"

    JWT_ALGORITHM: Literal["HS256", "RS256"] = "HS256"
    JWT_AUDIENCE: str = "authenticated"

    @field_validator("CORS_ORIGINS")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
