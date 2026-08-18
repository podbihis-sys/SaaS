from __future__ import annotations

from functools import lru_cache
from typing import Literal

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

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/termine"
    TEST_DATABASE_URL: str | None = None

    # --- Auth -------------------------------------------------------------
    # The app has no accounts in the classic sense: a device registers itself
    # with a random install id and receives a long-lived token.
    JWT_SECRET: str = "dev-insecure-change-me"
    JWT_ALGORITHM: Literal["HS256"] = "HS256"
    JWT_ISSUER: str = "termine-api"
    JWT_TTL_DAYS: int = 365

    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:19006"

    # --- Scanner ----------------------------------------------------------
    SCANNER_ENABLED: bool = True
    # Providers that may be contacted. `demo` is a fully local, synthetic
    # provider so the stack runs without touching any public authority.
    SCANNER_PROVIDERS: str = "demo"
    # Floor for how often a single office/service pair is polled, in seconds.
    # Provider adapters may declare a slower rate; the slower value wins.
    SCANNER_MIN_INTERVAL_SECONDS: int = 120
    SCANNER_TICK_SECONDS: int = 30
    # How far into the future slots are collected.
    SCANNER_HORIZON_DAYS: int = 90
    # Consecutive failures before an office is put in a cool-down.
    SCANNER_FAILURE_THRESHOLD: int = 5
    SCANNER_COOLDOWN_SECONDS: int = 1800
    HTTP_TIMEOUT_SECONDS: float = 15.0
    HTTP_USER_AGENT: str = (
        "TerminRadar/0.1 (+https://example.org/terminradar; appointment availability monitor)"
    )

    # --- Notifications ----------------------------------------------------
    EXPO_PUSH_URL: str = "https://exp.host/--/api/v2/push/send"
    EXPO_ACCESS_TOKEN: str | None = None
    PUSH_ENABLED: bool = True
    # A watch is not notified about the same slot twice, and not more often
    # than this many times per hour regardless of how many slots appear.
    NOTIFY_MAX_PER_HOUR: int = 12

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def enabled_providers(self) -> list[str]:
        return [p.strip() for p in self.SCANNER_PROVIDERS.split(",") if p.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
