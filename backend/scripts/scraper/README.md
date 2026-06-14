# Web scraping toolkit

A small, polite, reusable crawler plus the site-specific runner for
**bit-gmbh.de** (BIT Bierther GmbH — heatshrink / insulating tubing and braided
sleeving).

## Layout

| File | Purpose |
| --- | --- |
| `scraper/crawler.py` | Generic breadth-first crawler: robots.txt-aware, rate-limited, same-host, bounded by page/depth limits. |
| `scraper/extract.py` | HTML → data helpers (links, tables, German Impressum contact extraction). |
| `../scrape_bit_gmbh.py` | Site-specific runner that produces `company.json`, `catalog.json`, `pages.json` and `summary.md`. |

## Install

The scraper needs `beautifulsoup4` (and `httpx`, already a backend dependency):

```bash
cd backend
pip install -e ".[scrape]"
```

## Run

```bash
cd backend
python -m scripts.scrape_bit_gmbh --max-pages 150 --delay 1.0
# add --include-en to also crawl the English /en/ section
```

Output is written to `backend/data/bit_gmbh/` by default (git-ignored). Override
with `--output-dir`.

| Flag | Default | Meaning |
| --- | --- | --- |
| `--base-url` | `https://www.bit-gmbh.de/` | Site root to crawl. |
| `--max-pages` | `150` | Hard cap on pages fetched. |
| `--max-depth` | `3` | Maximum link depth from the root. |
| `--delay` | `1.0` | Seconds between requests (be polite). |
| `--include-en` | off | Also seed the `/en/` section. |
| `--include-subdomains` | off | Follow links into sub-domains. |
| `--no-robots` | off | Ignore robots.txt (use responsibly). |

## Network access note

Claude Code web sessions run behind a **network egress allowlist** chosen when
the environment was created. By default `www.bit-gmbh.de` is **not** on it, so
every request returns:

```
403 Host not in allowlist: www.bit-gmbh.de
```

To run the live crawl, either:

1. Add `www.bit-gmbh.de` (and `bit-gmbh.de`) to the environment's network egress
   settings — this generally requires a **new** session to take effect — or
2. Run the script from an unrestricted local environment.

The extraction logic is covered by offline unit tests
(`backend/tests/test_scraper_extract.py`) that need no network.

## Being a good citizen

The crawler defaults are conservative on purpose: it identifies itself with a
descriptive User-Agent, honours `robots.txt`, waits between requests and stays
on the target host. Only collect publicly available data and respect the site's
terms of use.
