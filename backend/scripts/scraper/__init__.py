"""Reusable, polite web-scraping toolkit.

This package provides a small, dependency-light crawler that can be pointed at
any public website. It is intentionally conservative by default: it honours
``robots.txt``, rate-limits requests, identifies itself with a descriptive
User-Agent and stays on the configured host. The site-specific extraction logic
lives outside this package (see ``scripts/scrape_bit_gmbh.py``) so the crawler
itself stays generic and reusable.
"""

from __future__ import annotations

from .crawler import CrawlConfig, Crawler, Page
from .extract import (
    ContactInfo,
    extract_contact_info,
    extract_links,
    extract_tables,
    normalise_whitespace,
    visible_text,
)

__all__ = [
    "ContactInfo",
    "CrawlConfig",
    "Crawler",
    "Page",
    "extract_contact_info",
    "extract_links",
    "extract_tables",
    "normalise_whitespace",
    "visible_text",
]
