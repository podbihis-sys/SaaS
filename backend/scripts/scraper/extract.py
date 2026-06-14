"""HTML extraction helpers shared by the site-specific scrapers.

These functions operate on :class:`bs4.BeautifulSoup` trees and return plain
Python data, so they are easy to unit-test and serialise to JSON. The contact
extractor is tuned for German company "Impressum" (legal notice) pages, which by
law must list the operator, address, contact details and commercial register
information - making them the most reliable source of structured company data.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Tag

# -- regexes ---------------------------------------------------------------
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?\d[\d\s/().-]{6,}\d)")
VAT_RE = re.compile(r"\bDE\s?\d{9}\b", re.IGNORECASE)
REGISTER_RE = re.compile(r"\bHR[AB]\s?\d+\b", re.IGNORECASE)

# Labels that introduce a value on an Impressum page (German + English).
_PHONE_LABELS = ("telefon", "tel.", "tel:", "phone", "fon")
_FAX_LABELS = ("fax", "telefax")


def normalise_whitespace(text: str) -> str:
    """Collapse runs of whitespace into single spaces and trim."""

    return re.sub(r"\s+", " ", text).strip()


def visible_text(soup: BeautifulSoup | Tag) -> str:
    """Return human-visible text, dropping script/style/nav noise."""

    clone = BeautifulSoup(str(soup), "html.parser")
    for tag in clone(["script", "style", "noscript", "template"]):
        tag.decompose()
    return normalise_whitespace(clone.get_text(" "))


def extract_links(soup: BeautifulSoup, base_url: str) -> list[dict[str, str]]:
    """Return ``[{"text", "url"}]`` for every in-page anchor."""

    out: list[dict[str, str]] = []
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"].strip()
        if not href or href.startswith(("javascript:", "#")):
            continue
        out.append(
            {
                "text": normalise_whitespace(anchor.get_text(" ")),
                "url": urljoin(base_url, href),
            }
        )
    return out


def extract_tables(soup: BeautifulSoup) -> list[list[list[str]]]:
    """Return every ``<table>`` as a list of rows of cell strings."""

    tables: list[list[list[str]]] = []
    for table in soup.find_all("table"):
        rows: list[list[str]] = []
        for tr in table.find_all("tr"):
            cells = [
                normalise_whitespace(cell.get_text(" "))
                for cell in tr.find_all(["th", "td"])
            ]
            if any(cells):
                rows.append(cells)
        if rows:
            tables.append(rows)
    return tables


@dataclass
class ContactInfo:
    """Structured company / contact data, typically from an Impressum page."""

    source_url: str
    company_name: str | None = None
    address_lines: list[str] = field(default_factory=list)
    emails: list[str] = field(default_factory=list)
    phones: list[str] = field(default_factory=list)
    fax: list[str] = field(default_factory=list)
    managing_directors: list[str] = field(default_factory=list)
    vat_id: str | None = None
    register_number: str | None = None

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def _label_value(line: str, labels: tuple[str, ...]) -> str | None:
    low = line.lower()
    for label in labels:
        if label in low:
            # Take the part after the label and pull out the phone-like run.
            tail = line[low.index(label) + len(label):]
            match = PHONE_RE.search(tail)
            if match:
                return normalise_whitespace(match.group())
    return None


def extract_contact_info(soup: BeautifulSoup, source_url: str) -> ContactInfo:
    """Best-effort extraction of company contact data from a page.

    The heuristics are deliberately forgiving: every field is optional and the
    caller should treat the result as a starting point that may need manual
    confirmation against the live page.
    """

    info = ContactInfo(source_url=source_url)

    # Prefer the main content region if the page marks one up.
    main = soup.find("main") or soup.find(id="content") or soup.body or soup
    text = visible_text(main)
    raw_lines = [
        normalise_whitespace(line)
        for line in main.get_text("\n").splitlines()
        if normalise_whitespace(line)
    ]

    # Emails: prefer mailto links (robust against obfuscation), then text.
    for anchor in soup.select('a[href^="mailto:"]'):
        addr = anchor["href"].split(":", 1)[1].split("?", 1)[0].strip()
        if addr and addr not in info.emails:
            info.emails.append(addr)
    for match in EMAIL_RE.findall(text):
        if match not in info.emails:
            info.emails.append(match)

    # Phone / fax from labelled lines.
    for line in raw_lines:
        phone = _label_value(line, _PHONE_LABELS)
        if phone and phone not in info.phones:
            info.phones.append(phone)
        fax = _label_value(line, _FAX_LABELS)
        if fax and fax not in info.fax:
            info.fax.append(fax)

    # VAT id and commercial register number.
    vat = VAT_RE.search(text)
    if vat:
        info.vat_id = normalise_whitespace(vat.group())
    register = REGISTER_RE.search(text)
    if register:
        info.register_number = normalise_whitespace(register.group())

    # Managing directors ("Geschäftsführer" / "Managing Director").
    for line in raw_lines:
        low = line.lower()
        if "geschäftsführer" in low or "managing director" in low:
            after = re.split(r"geschäftsführer\w*\s*:?|managing director\s*:?", line, flags=re.IGNORECASE)
            value = normalise_whitespace(after[-1]) if len(after) > 1 else ""
            if value and value not in info.managing_directors:
                info.managing_directors.append(value)

    # Company name: the GmbH/AG/UG line is the best signal, else the first
    # heading, else the first non-trivial line.
    for line in raw_lines:
        if re.search(r"\b(GmbH|AG|UG|KG|GbR|e\.K\.|mbH)\b", line):
            info.company_name = line
            break
    if info.company_name is None:
        heading = main.find(["h1", "h2"])
        if heading is not None:
            info.company_name = normalise_whitespace(heading.get_text(" "))

    # Address: the first few lines around the company name that look postal
    # (contain a German 5-digit postal code or a street keyword).
    info.address_lines = _guess_address(raw_lines)

    return info


def _guess_address(lines: list[str]) -> list[str]:
    address: list[str] = []
    postal_re = re.compile(r"\b\d{5}\b")
    street_re = re.compile(r"(stra(ß|ss)e|str\.|weg|allee|platz|gasse|ring)\b", re.IGNORECASE)
    for idx, line in enumerate(lines):
        if postal_re.search(line) or street_re.search(line):
            # Grab the surrounding two lines as a rough address block.
            start = max(0, idx - 1)
            for candidate in lines[start: idx + 2]:
                if candidate not in address and len(candidate) < 120:
                    address.append(candidate)
            if address:
                break
    return address
