from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx

from app.config import settings
from app.logging_config import get_logger

log = get_logger(__name__)

#: How long a fetched robots.txt is trusted before being re-read. Long enough
#: not to add traffic, short enough that a newly published Disallow takes
#: effect the same day.
_TTL_SECONDS = 6 * 60 * 60

#: A host that will not tell us its rules is not thereby giving permission —
#: but neither is a transient 500 a prohibition. Network failures leave the
#: previous verdict in place and default to allowed, matching how every other
#: well-behaved crawler treats an unreachable robots.txt.
_DEFAULT_ON_ERROR = True


@dataclass(slots=True)
class RobotsVerdict:
    allowed: bool
    reason: str


class RobotsCache:
    """Fetches and caches robots.txt, and answers whether a URL may be fetched.

    This exists because the project's own rules (see docs/legal.md) say the
    scanner must respect robots.txt, and a rule that depends on somebody
    remembering it is not a rule. Bremen is the concrete case: its booking
    system publishes ``Disallow: /`` for every agent, so no adapter may poll it
    however correct the adapter itself is.
    """

    def __init__(self) -> None:
        self._parsers: dict[str, tuple[RobotFileParser | None, float]] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    def _origin(self, url: str) -> str:
        parts = urlparse(url)
        return f"{parts.scheme}://{parts.netloc}"

    async def _load(self, client: httpx.AsyncClient, origin: str) -> RobotFileParser | None:
        try:
            response = await client.get(f"{origin}/robots.txt", timeout=10.0)
        except httpx.HTTPError as exc:
            log.warning("robots.fetch_failed", origin=origin, error=str(exc))
            return None

        if response.status_code >= 400:
            # 404 is the common case and means "no restrictions".
            return None

        parser = RobotFileParser()
        parser.parse(response.text.splitlines())
        return parser

    async def allowed(self, client: httpx.AsyncClient, url: str) -> RobotsVerdict:
        origin = self._origin(url)
        now = time.monotonic()

        cached = self._parsers.get(origin)
        if cached is None or now - cached[1] > _TTL_SECONDS:
            lock = self._locks.setdefault(origin, asyncio.Lock())
            async with lock:
                # Re-check inside the lock: several offices on one host can
                # arrive together and would otherwise each fetch robots.txt.
                cached = self._parsers.get(origin)
                if cached is None or time.monotonic() - cached[1] > _TTL_SECONDS:
                    parser = await self._load(client, origin)
                    cached = (parser, time.monotonic())
                    self._parsers[origin] = cached

        parser = cached[0]
        if parser is None:
            return RobotsVerdict(_DEFAULT_ON_ERROR, "no robots.txt")

        # The product token, e.g. "TerminRadar" out of "TerminRadar/0.1 (+...)".
        # RobotFileParser falls back to the `*` group itself when no group
        # names us, so asking twice would let a rule aimed at us be overruled
        # by a permissive wildcard.
        agent = settings.HTTP_USER_AGENT.split("/")[0].strip() or "*"
        if parser.can_fetch(agent, url):
            return RobotsVerdict(True, "allowed by robots.txt")
        return RobotsVerdict(False, "disallowed by robots.txt")

    def clear(self) -> None:
        """Drop everything cached. Used by tests."""
        self._parsers.clear()


robots = RobotsCache()
