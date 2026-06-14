#!/usr/bin/env python3
"""Scrape https://www.bit-gmbh.de (BIT Bierther GmbH) into structured data.

BIT Bierther GmbH manufactures heatshrink / insulating tubing and braided
sleeving. This script crawls the public site politely (see
``scripts/scraper/crawler.py``) and produces three JSON artefacts plus a human
readable Markdown summary:

* ``company.json``  - operator, address and contact data from the Impressum.
* ``catalog.json``  - product / category pages with headings, descriptions,
                       product links and any specification tables found.
* ``pages.json``    - a flat index of every page that was fetched.
* ``summary.md``    - a quick, human-readable overview of the run.

Usage::

    # one-time: install scraping deps
    pip install -e ".[scrape]"

    # run (writes into backend/data/bit_gmbh by default)
    python -m scripts.scrape_bit_gmbh --max-pages 150 --delay 1.0

Network note: this repository's web sessions run behind a network egress
allowlist. ``www.bit-gmbh.de`` must be on that allowlist (or run the script from
an unrestricted environment) for the crawl to succeed; otherwise every request
returns ``403 Host not in allowlist``.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from scripts.scraper import (  # noqa: E402
    CrawlConfig,
    Crawler,
    Page,
    extract_contact_info,
    extract_links,
    extract_tables,
    normalise_whitespace,
)

logger = logging.getLogger("scrape_bit_gmbh")

DEFAULT_BASE_URL = "https://www.bit-gmbh.de/"
DEFAULT_OUTPUT_DIR = ROOT / "data" / "bit_gmbh"

# URL path fragments that mark a page as part of the product catalogue.
CATALOG_KEYWORDS = (
    "produkt",
    "product",
    "sortiment",
    "hersteller",
    "manufacturer",
    "schrumpfschlauch",
    "isolierschlauch",
    "geflecht",
    "sleev",
    "tubing",
    "katalog",
    "catalog",
)
IMPRESSUM_KEYWORDS = ("impressum", "imprint", "legal", "kontakt", "contact")


@dataclass
class PageRecord:
    url: str
    title: str
    depth: int
    text_length: int
    is_catalog: bool
    is_impressum: bool

    def to_dict(self) -> dict[str, object]:
        return {
            "url": self.url,
            "title": self.title,
            "depth": self.depth,
            "text_length": self.text_length,
            "is_catalog": self.is_catalog,
            "is_impressum": self.is_impressum,
        }


@dataclass
class CatalogEntry:
    url: str
    title: str
    breadcrumb: list[str] = field(default_factory=list)
    description: str = ""
    product_links: list[dict[str, str]] = field(default_factory=list)
    spec_tables: list[list[list[str]]] = field(default_factory=list)

    def to_dict(self) -> dict[str, object]:
        return {
            "url": self.url,
            "title": self.title,
            "breadcrumb": self.breadcrumb,
            "description": self.description,
            "product_links": self.product_links,
            "spec_tables": self.spec_tables,
        }


def _page_title(page: Page) -> str:
    h1 = page.soup.find("h1")
    if h1 is not None:
        title = normalise_whitespace(h1.get_text(" "))
        if title:
            return title
    if page.soup.title and page.soup.title.string:
        return normalise_whitespace(page.soup.title.string)
    return urlparse(page.url).path or page.url


def _matches(url: str, keywords: tuple[str, ...]) -> bool:
    low = url.lower()
    return any(kw in low for kw in keywords)


def _extract_breadcrumb(page: Page) -> list[str]:
    crumb = page.soup.find(
        attrs={"class": lambda c: bool(c) and "breadcrumb" in " ".join(c).lower()}
    )
    if crumb is None:
        return []
    return [
        normalise_whitespace(a.get_text(" "))
        for a in crumb.find_all(["a", "span", "li"])
        if normalise_whitespace(a.get_text(" "))
    ]


def _extract_description(page: Page) -> str:
    main = page.soup.find("main") or page.soup.find(id="content") or page.soup.body
    if main is None:
        return ""
    para = main.find("p")
    return normalise_whitespace(para.get_text(" ")) if para is not None else ""


def _build_catalog_entry(page: Page) -> CatalogEntry:
    links = [
        link
        for link in extract_links(page.soup, page.url)
        if _matches(link["url"], CATALOG_KEYWORDS) and link["text"]
    ]
    return CatalogEntry(
        url=page.url,
        title=_page_title(page),
        breadcrumb=_extract_breadcrumb(page),
        description=_extract_description(page),
        product_links=links,
        spec_tables=extract_tables(page.soup),
    )


def run(config: CrawlConfig, output_dir: Path) -> dict[str, object]:
    output_dir.mkdir(parents=True, exist_ok=True)

    pages: list[PageRecord] = []
    catalog: list[CatalogEntry] = []
    contact_payloads: list[dict[str, object]] = []

    with Crawler(config) as crawler:
        for page in crawler.crawl():
            is_catalog = _matches(page.url, CATALOG_KEYWORDS)
            is_impressum = _matches(page.url, IMPRESSUM_KEYWORDS)
            title = _page_title(page)
            pages.append(
                PageRecord(
                    url=page.url,
                    title=title,
                    depth=page.depth,
                    text_length=len(page.soup.get_text(" ")),
                    is_catalog=is_catalog,
                    is_impressum=is_impressum,
                )
            )
            logger.info("page %3d  %s", len(pages), page.url)

            if is_catalog:
                catalog.append(_build_catalog_entry(page))
            if is_impressum:
                contact_payloads.append(extract_contact_info(page.soup, page.url).to_dict())

    company = _merge_contacts(contact_payloads)

    _write_json(output_dir / "pages.json", [p.to_dict() for p in pages])
    _write_json(output_dir / "catalog.json", [c.to_dict() for c in catalog])
    _write_json(output_dir / "company.json", company)
    summary = _write_summary(output_dir / "summary.md", config, pages, catalog, company)

    return {
        "pages": len(pages),
        "catalog_pages": len(catalog),
        "company": company,
        "summary": summary,
        "output_dir": str(output_dir),
    }


def _merge_contacts(payloads: list[dict[str, object]]) -> dict[str, object]:
    """Combine several Impressum/Kontakt extractions into one record."""

    if not payloads:
        return {}
    merged: dict[str, object] = dict(payloads[0])
    for extra in payloads[1:]:
        for key, value in extra.items():
            if isinstance(value, list):
                base = merged.setdefault(key, [])
                if isinstance(base, list):
                    for item in value:
                        if item not in base:
                            base.append(item)
            elif not merged.get(key):
                merged[key] = value
    return merged


def _write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info("wrote %s", path)


def _write_summary(
    path: Path,
    config: CrawlConfig,
    pages: list[PageRecord],
    catalog: list[CatalogEntry],
    company: dict[str, object],
) -> str:
    lines = [
        "# bit-gmbh.de scrape summary",
        "",
        f"- Base URL: {config.base_url}",
        f"- Pages fetched: {len(pages)}",
        f"- Catalog pages: {len(catalog)}",
        "",
        "## Company",
        "",
    ]
    if company:
        lines.append(f"- Name: {company.get('company_name') or 'n/a'}")
        addr = company.get("address_lines") or []
        if isinstance(addr, list) and addr:
            lines.append(f"- Address: {', '.join(str(a) for a in addr)}")
        for label, key in (("Email", "emails"), ("Phone", "phones"), ("Fax", "fax")):
            values = company.get(key) or []
            if isinstance(values, list) and values:
                lines.append(f"- {label}: {', '.join(str(v) for v in values)}")
        if company.get("vat_id"):
            lines.append(f"- VAT ID: {company['vat_id']}")
        if company.get("register_number"):
            lines.append(f"- Register: {company['register_number']}")
    else:
        lines.append("_No Impressum/Kontakt page was found during the crawl._")

    lines += ["", "## Catalog pages", ""]
    for entry in catalog:
        lines.append(f"### {entry.title}")
        lines.append(f"- URL: {entry.url}")
        if entry.description:
            lines.append(f"- {entry.description}")
        lines.append(f"- Product links: {len(entry.product_links)}")
        lines.append(f"- Spec tables: {len(entry.spec_tables)}")
        lines.append("")

    text = "\n".join(lines).rstrip() + "\n"
    path.write_text(text, encoding="utf-8")
    logger.info("wrote %s", path)
    return text


def build_config(args: argparse.Namespace) -> CrawlConfig:
    seeds: list[str] = []
    if args.include_en:
        seeds.append(args.base_url.rstrip("/") + "/en/")
    return CrawlConfig(
        base_url=args.base_url,
        max_pages=args.max_pages,
        max_depth=args.max_depth,
        delay_seconds=args.delay,
        respect_robots=not args.no_robots,
        include_subdomains=args.include_subdomains,
        seed_urls=seeds,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Site root to crawl.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR, help="Where to write JSON output.")
    parser.add_argument("--max-pages", type=int, default=150, help="Hard cap on pages fetched.")
    parser.add_argument("--max-depth", type=int, default=3, help="Maximum link depth from the root.")
    parser.add_argument("--delay", type=float, default=1.0, help="Seconds to wait between requests.")
    parser.add_argument("--include-en", action="store_true", help="Also seed the /en/ section.")
    parser.add_argument("--include-subdomains", action="store_true", help="Follow links into sub-domains.")
    parser.add_argument("--no-robots", action="store_true", help="Ignore robots.txt (use responsibly).")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose (DEBUG) logging.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    config = build_config(args)
    result = run(config, args.output_dir)
    print(
        f"\nDone: {result['pages']} pages, {result['catalog_pages']} catalog pages -> {result['output_dir']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
