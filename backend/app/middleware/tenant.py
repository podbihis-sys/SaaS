from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.logging_config import company_id_ctx, user_id_ctx


class TenantContextMiddleware(BaseHTTPMiddleware):
    """Resets contextvars per request. Dependencies fill them on auth."""

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        c_token = company_id_ctx.set(None)
        u_token = user_id_ctx.set(None)
        try:
            response: Response = await call_next(request)
        finally:
            company_id_ctx.reset(c_token)
            user_id_ctx.reset(u_token)
        return response
