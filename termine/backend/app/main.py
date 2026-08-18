from __future__ import annotations

import asyncio
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import settings
from app.core.errors import AppError
from app.logging_config import configure_logging, get_logger, request_id_ctx, user_id_ctx
from app.services.scanner import scan_loop

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    stop = asyncio.Event()
    task: asyncio.Task | None = None

    if settings.SCANNER_ENABLED:
        # The scanner runs in-process. That is deliberate at this size: one
        # deployment unit, no broker, and the scan cadence is measured in
        # minutes rather than milliseconds. Splitting it out becomes worthwhile
        # once more than one API replica is needed.
        task = asyncio.create_task(scan_loop(stop), name="scanner")

    try:
        yield
    finally:
        stop.set()
        if task is not None:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            except Exception as exc:  # noqa: BLE001 - shutdown must not raise
                log.error("scanner.shutdown_failed", error=str(exc))


app = FastAPI(
    title="TerminRadar API",
    version="0.1.0",
    description=(
        "Watches appointment availability at German public authorities and pushes an alert "
        "when a slot matching a user's search order appears."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):  # type: ignore[no-untyped-def]
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request_id_ctx.set(request_id)
    user_id_ctx.set(None)
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
            "request_id": request_id_ctx.get(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "code": "validation_error",
            "message": "Invalid request",
            "details": {"errors": jsonable_encoder(exc.errors())},
            "request_id": request_id_ctx.get(),
        },
    )


app.include_router(api_router)


@app.get("/")
async def root() -> dict:
    return {"service": "termine-api", "version": app.version, "docs": "/docs"}
