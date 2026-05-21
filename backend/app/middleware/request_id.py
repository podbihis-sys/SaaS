from __future__ import annotations

import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.logging_config import request_id_ctx


class RequestIDMiddleware(BaseHTTPMiddleware):
    HEADER = "X-Request-ID"

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        rid = request.headers.get(self.HEADER) or str(uuid.uuid4())
        token = request_id_ctx.set(rid)
        request.state.request_id = rid
        try:
            response: Response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers[self.HEADER] = rid
        return response
