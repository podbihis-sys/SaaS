from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx
import jwt
from jwt import PyJWKClient

from app.config import settings
from app.core.errors import Unauthorized


@dataclass(frozen=True, slots=True)
class JWTClaims:
    sub: str
    email: str | None
    raw: dict[str, Any]


_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient | None:
    global _jwks_client
    if not settings.SUPABASE_JWT_JWKS_URL:
        return None
    if _jwks_client is None:
        _jwks_client = PyJWKClient(settings.SUPABASE_JWT_JWKS_URL)
    return _jwks_client


def verify_token(token: str) -> JWTClaims:
    """Verify a Supabase JWT.

    Supports HS256 with shared secret OR RS256 via JWKS URL.
    """
    if not token:
        raise Unauthorized("Missing bearer token")

    options = {"verify_aud": True}
    audience = settings.JWT_AUDIENCE or None

    try:
        jwks = _get_jwks_client()
        if jwks is not None:
            signing_key = jwks.get_signing_key_from_jwt(token).key
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=audience,
                options=options,
            )
        else:
            if not settings.SUPABASE_JWT_SECRET:
                raise Unauthorized("JWT verification not configured")
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM],
                audience=audience,
                options=options,
            )
    except jwt.ExpiredSignatureError as e:
        raise Unauthorized("Token expired") from e
    except jwt.InvalidTokenError as e:
        raise Unauthorized(f"Invalid token: {e}") from e
    except httpx.HTTPError as e:
        raise Unauthorized(f"JWKS fetch failed: {e}") from e

    sub = str(payload.get("sub", "")).strip()
    if not sub:
        raise Unauthorized("Token missing subject")

    email = payload.get("email")
    return JWTClaims(sub=sub, email=email if isinstance(email, str) else None, raw=payload)


def extract_bearer(authorization: str | None) -> str:
    if not authorization:
        raise Unauthorized("Missing Authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise Unauthorized("Authorization must be 'Bearer <token>'")
    return parts[1]
