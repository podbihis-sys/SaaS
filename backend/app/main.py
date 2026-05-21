from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from starlette.responses import Response

from app.api.v1.router import api_router
from app.config import settings
from app.core.errors import AppError
from app.logging_config import configure_logging, get_logger, request_id_ctx
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.tenant import TenantContextMiddleware
from app.models import Base  # noqa: F401  populate metadata
from app.models.base import install_tenant_guard

configure_logging()
install_tenant_guard()

logger = get_logger("app")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("backend_starting", env=settings.ENV)
    yield
    logger.info("backend_stopping")


app = FastAPI(
    title="Handwerk SaaS API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(TenantContextMiddleware)
app.add_middleware(RequestIDMiddleware)


def _problem(status_code: int, code: str, title: str, detail: str | None = None,
             errors: list[dict[str, object]] | None = None) -> JSONResponse:
    body: dict[str, object] = {
        "type": "about:blank",
        "title": title,
        "status": status_code,
        "code": code,
        "request_id": request_id_ctx.get(),
    }
    if detail is not None:
        body["detail"] = detail
    if errors is not None:
        body["errors"] = errors
    return JSONResponse(status_code=status_code, content=body)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> Response:
    return _problem(exc.status_code, exc.code, exc.message, detail=str(exc) or None)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> Response:
    return _problem(
        422,
        "validation_error",
        "Invalid request",
        errors=[dict(e) for e in exc.errors()],
    )


@app.exception_handler(PydanticValidationError)
async def pydantic_error_handler(_: Request, exc: PydanticValidationError) -> Response:
    return _problem(
        422, "validation_error", "Invalid payload", errors=[dict(e) for e in exc.errors()]
    )


@app.exception_handler(Exception)
async def unhandled_handler(_: Request, exc: Exception) -> Response:
    logger.exception("unhandled_exception", error=str(exc))
    return _problem(500, "internal_error", "Internal server error", detail=str(exc))


app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {"service": "handwerk-backend", "version": "0.1.0", "docs": "/docs"}


__all__ = ["app"]
