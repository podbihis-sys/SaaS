from __future__ import annotations

import asyncio
import re
import time
from dataclasses import dataclass, field
from urllib.parse import urlparse

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


@dataclass(slots=True)
class _Group:
    agents: list[str] = field(default_factory=list)
    #: (allow, pattern) in file order.
    rules: list[tuple[bool, str]] = field(default_factory=list)


class RobotsRules:
    """A parsed robots.txt with wildcard-aware matching.

    The standard library's ``RobotFileParser`` compares Disallow paths as
    literal prefixes, so ``Disallow: /standort/*/pdf/`` never matches anything
    and the file reads as more permissive than it is. That is the dangerous
    direction: a scanner that misreads a prohibition as permission is exactly
    the tool that gets an IP range blocked. This implements the matching every
    major crawler actually uses — ``*`` matches any run of characters, ``$``
    anchors the end, and the longest matching rule wins, with Allow beating
    Disallow on a tie.
    """

    def __init__(self, text: str) -> None:
        self.groups: list[_Group] = []
        current: _Group | None = None
        # A group is a run of User-agent lines followed by rules; a User-agent
        # line after rules starts a new group.
        expecting_agents = True

        for raw in text.splitlines():
            line = raw.split("#", 1)[0].strip()
            if not line or ":" not in line:
                continue
            key, _, value = line.partition(":")
            key = key.strip().lower()
            value = value.strip()

            if key == "user-agent":
                if current is None or not expecting_agents:
                    current = _Group()
                    self.groups.append(current)
                    expecting_agents = True
                current.agents.append(value.lower())
            elif key in ("allow", "disallow"):
                if current is None:
                    # Rules before any User-agent line apply to nobody.
                    continue
                expecting_agents = False
                if value:
                    current.rules.append((key == "allow", value))
                elif key == "disallow":
                    # `Disallow:` with an empty value means "allow everything"
                    # and is written as such so it participates in matching.
                    current.rules.append((True, "/"))

    def _group_for(self, agent: str) -> _Group | None:
        """The most specific group naming this agent, else the `*` group.

        A group that names us is authoritative even if a `*` group would be
        more permissive; that is the whole point of naming an agent.
        """
        agent = agent.lower()
        best: _Group | None = None
        best_len = -1
        wildcard: _Group | None = None
        for group in self.groups:
            for name in group.agents:
                if name == "*":
                    wildcard = wildcard or group
                elif (name in agent or agent in name) and len(name) > best_len:
                    best, best_len = group, len(name)
        return best or wildcard

    @staticmethod
    def _pattern_to_regex(pattern: str) -> re.Pattern[str]:
        anchored = pattern.endswith("$")
        core = pattern[:-1] if anchored else pattern
        parts = [re.escape(piece) for piece in core.split("*")]
        body = ".*".join(parts)
        return re.compile("^" + body + ("$" if anchored else ""))

    def allowed(self, agent: str, path: str) -> bool:
        group = self._group_for(agent)
        if group is None or not group.rules:
            return True

        winner: tuple[int, bool] | None = None
        for allow, pattern in group.rules:
            if not self._pattern_to_regex(pattern).match(path):
                continue
            specificity = len(pattern)
            if winner is None or specificity > winner[0] or (specificity == winner[0] and allow):
                winner = (specificity, allow)
        return True if winner is None else winner[1]


class RobotsCache:
    """Fetches and caches robots.txt, and answers whether a URL may be fetched.

    This exists because the project's own rules (see docs/legal.md) say the
    scanner must respect robots.txt, and a rule that depends on somebody
    remembering it is not a rule. Bremen and Berlin are the concrete cases:
    both forbid the booking paths and both point at an API to ask for instead.
    """

    def __init__(self) -> None:
        self._rules: dict[str, tuple[RobotsRules | None, float]] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    def _origin(self, url: str) -> str:
        parts = urlparse(url)
        return f"{parts.scheme}://{parts.netloc}"

    async def _load(self, client: httpx.AsyncClient, origin: str) -> RobotsRules | None:
        try:
            response = await client.get(f"{origin}/robots.txt", timeout=10.0)
        except httpx.HTTPError as exc:
            log.warning("robots.fetch_failed", origin=origin, error=str(exc))
            return None

        if response.status_code >= 400:
            # 404 is the common case and means "no restrictions".
            return None
        return RobotsRules(response.text)

    async def allowed(self, client: httpx.AsyncClient, url: str) -> RobotsVerdict:
        origin = self._origin(url)
        now = time.monotonic()

        cached = self._rules.get(origin)
        if cached is None or now - cached[1] > _TTL_SECONDS:
            lock = self._locks.setdefault(origin, asyncio.Lock())
            async with lock:
                # Re-check inside the lock: several offices on one host can
                # arrive together and would otherwise each fetch robots.txt.
                cached = self._rules.get(origin)
                if cached is None or time.monotonic() - cached[1] > _TTL_SECONDS:
                    rules = await self._load(client, origin)
                    cached = (rules, time.monotonic())
                    self._rules[origin] = cached

        rules = cached[0]
        if rules is None:
            return RobotsVerdict(_DEFAULT_ON_ERROR, "no robots.txt")

        # The product token, e.g. "TerminRadar" out of "TerminRadar/0.1 (+...)".
        agent = settings.HTTP_USER_AGENT.split("/")[0].strip() or "*"
        path = urlparse(url).path or "/"
        if rules.allowed(agent, path):
            return RobotsVerdict(True, "allowed by robots.txt")
        return RobotsVerdict(False, "disallowed by robots.txt")

    def clear(self) -> None:
        """Drop everything cached. Used by tests."""
        self._rules.clear()


robots = RobotsCache()
