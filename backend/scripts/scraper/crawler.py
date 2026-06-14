"""A small, polite breadth-first web crawler built on httpx.

Design goals:

* **Polite by default** - obeys ``robots.txt``, waits ``delay`` seconds between
  requests and sends a descriptive, contactable ``User-Agent``.
* **Bounded** - hard limits on page count and crawl depth so a run always
  terminates, even on a site with circular links.
* **Same-site** - only follows links that stay on the configured host (and,
  optionally, its sub-domains); never wanders onto third-party domains.
* **Resilient** - network and parse errors on a single page are logged and
  skipped rather than aborting the whole crawl.

The crawler yields :class:`Page` objects; turning a page into structured data is
the caller's job (see :mod:`scripts.scraper.extract`).
"""

from __future__ import annotations

import logging
import time
import urllib.robotparser
from collections import deque
from collections.abc import Callable, Iterator
from dataclasses import dataclass, field
from functools import cached_property
from urllib.parse import urldefrag, urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

DEFAULT_USER_AGENT = (
    "BIT-catalog-scraper/1.0 "
    "(+https://github.com/podbihis-sys/saas; polite, robots-respecting)"
)


@dataclass(slots=True)
class Page:
    """A single fetched HTML page."""

    url: str
    status_code: int
    html: str
    depth: int
    content_type: str = "text/html"

    @cached_property
    def soup(self) -> BeautifulSoup:
        return BeautifulSoup(self.html, "html.parser")

    @property
    def is_html(self) -> bool:
        return "html" in self.content_type.lower()


@dataclass
class CrawlConfig:
    """Configuration for a single crawl run."""

    base_url: str
    max_pages: int = 200
    max_depth: int = 3
    delay_seconds: float = 1.0
    timeout_seconds: float = 30.0
    user_agent: str = DEFAULT_USER_AGENT
    respect_robots: bool = True
    include_subdomains: bool = False
    # Optional predicate to decide whether a discovered URL should be queued.
    url_filter: Callable[[str], bool] | None = None
    # Extra start URLs to seed the queue beyond ``base_url``.
    seed_urls: list[str] = field(default_factory=list)

    @property
    def base_host(self) -> str:
        return urlparse(self.base_url).netloc.lower()


class Crawler:
    """Breadth-first, robots-aware crawler for a single site."""

    def __init__(self, config: CrawlConfig) -> None:
        self.config = config
        self._robots: urllib.robotparser.RobotFileParser | None = None
        self._client = httpx.Client(
            headers={"User-Agent": config.user_agent},
            timeout=config.timeout_seconds,
            follow_redirects=True,
        )

    # -- context manager ---------------------------------------------------
    def __enter__(self) -> Crawler:
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    def close(self) -> None:
        self._client.close()

    # -- robots ------------------------------------------------------------
    def _load_robots(self) -> None:
        if not self.config.respect_robots:
            return
        robots_url = urljoin(self.config.base_url, "/robots.txt")
        parser = urllib.robotparser.RobotFileParser()
        try:
            resp = self._client.get(robots_url)
            if resp.status_code == 200:
                parser.parse(resp.text.splitlines())
            else:
                # No robots.txt (or an error) means "nothing disallowed".
                parser.parse([])
        except httpx.HTTPError as exc:  # pragma: no cover - network dependent
            logger.warning("could not fetch robots.txt (%s): %s", robots_url, exc)
            parser.parse([])
        self._robots = parser

    def _allowed_by_robots(self, url: str) -> bool:
        if not self.config.respect_robots or self._robots is None:
            return True
        return self._robots.can_fetch(self.config.user_agent, url)

    # -- url scoping -------------------------------------------------------
    def _in_scope(self, url: str) -> bool:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        host = parsed.netloc.lower()
        if self.config.include_subdomains:
            base = self.config.base_host
            in_host = host == base or host.endswith("." + base)
        else:
            in_host = host == self.config.base_host
        if not in_host:
            return False
        return self.config.url_filter is None or self.config.url_filter(url)

    # -- fetching ----------------------------------------------------------
    def fetch(self, url: str, depth: int = 0) -> Page | None:
        try:
            resp = self._client.get(url)
        except httpx.HTTPError as exc:  # pragma: no cover - network dependent
            logger.warning("fetch failed %s: %s", url, exc)
            return None
        content_type = resp.headers.get("content-type", "text/html")
        if resp.status_code != 200:
            logger.info("skip %s (status %s)", url, resp.status_code)
            return None
        if "html" not in content_type.lower():
            logger.debug("skip non-html %s (%s)", url, content_type)
            return None
        return Page(
            url=str(resp.url),
            status_code=resp.status_code,
            html=resp.text,
            depth=depth,
            content_type=content_type,
        )

    # -- crawl -------------------------------------------------------------
    def crawl(self) -> Iterator[Page]:
        """Yield pages in breadth-first order until limits are reached."""

        self._load_robots()
        start_urls = [self.config.base_url, *self.config.seed_urls]
        queue: deque[tuple[str, int]] = deque(
            (self._canonical(u), 0) for u in start_urls
        )
        seen: set[str] = {u for u, _ in queue}
        fetched = 0

        while queue and fetched < self.config.max_pages:
            url, depth = queue.popleft()
            if not self._allowed_by_robots(url):
                logger.info("robots.txt disallows %s", url)
                continue

            page = self.fetch(url, depth)
            if page is None:
                continue
            fetched += 1
            yield page

            if depth >= self.config.max_depth:
                continue
            for link in self._discover_links(page):
                if link not in seen and self._in_scope(link):
                    seen.add(link)
                    queue.append((link, depth + 1))

            # Be polite: pause between requests.
            if self.config.delay_seconds > 0:
                time.sleep(self.config.delay_seconds)

    # -- helpers -----------------------------------------------------------
    def _discover_links(self, page: Page) -> list[str]:
        links: list[str] = []
        for anchor in page.soup.find_all("a", href=True):
            href = anchor["href"].strip()
            if not href or href.startswith(("mailto:", "tel:", "javascript:", "#")):
                continue
            links.append(self._canonical(urljoin(page.url, href)))
        return links

    @staticmethod
    def _canonical(url: str) -> str:
        # Drop URL fragments so ``/p#a`` and ``/p#b`` are treated as one page.
        clean, _ = urldefrag(url)
        return clean.rstrip("/") or clean
