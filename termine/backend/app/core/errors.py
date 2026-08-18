from __future__ import annotations

from typing import Any


class AppError(Exception):
    status_code: int = 500
    code: str = "internal_error"
    default_message: str = "Internal server error"

    def __init__(self, message: str | None = None, *, details: dict[str, Any] | None = None) -> None:
        super().__init__(message or self.default_message)
        self.message = message or self.default_message
        self.details = details or {}


class NotFound(AppError):
    status_code = 404
    code = "not_found"
    default_message = "Resource not found"


class Forbidden(AppError):
    status_code = 403
    code = "forbidden"
    default_message = "Access denied"


class Unauthorized(AppError):
    status_code = 401
    code = "unauthorized"
    default_message = "Authentication required"


class ValidationError(AppError):
    status_code = 422
    code = "validation_error"
    default_message = "Invalid request"


class Conflict(AppError):
    status_code = 409
    code = "conflict"
    default_message = "Resource conflict"


class ProviderError(AppError):
    """A booking system could not be reached or returned something unusable."""

    status_code = 502
    code = "provider_error"
    default_message = "Booking system unavailable"


class ProviderUnsupported(AppError):
    """The requested operation is not offered by this booking system."""

    status_code = 501
    code = "provider_unsupported"
    default_message = "Operation not supported by this booking system"
