"""Offline tests for the scraper extraction helpers.

These tests exercise the pure HTML parsing logic against fixed fixtures, so they
run without any network access and verify the contact / table / link extractors
behave as expected on a German Impressum-style page.
"""

from __future__ import annotations

from bs4 import BeautifulSoup

from scripts.scraper.extract import (
    extract_contact_info,
    extract_links,
    extract_tables,
    normalise_whitespace,
)

IMPRESSUM_HTML = """
<html><body><main>
  <h1>Impressum</h1>
  <p>BIT Bierther GmbH</p>
  <p>Musterstraße 12<br>53111 Bonn</p>
  <p>Telefon: +49 228 123456<br>Telefax: +49 228 123457</p>
  <p>E-Mail: <a href="mailto:info@bit-gmbh.de">info@bit-gmbh.de</a></p>
  <p>Geschäftsführer: Max Bierther</p>
  <p>Registergericht: Amtsgericht Bonn, HRB 12345</p>
  <p>USt-IdNr.: DE123456789</p>
</main></body></html>
"""

CATALOG_HTML = """
<html><body><main>
  <h1>Schrumpfschlauch</h1>
  <p>Hochwertige Schrumpfschläuche aus Polyolefin.</p>
  <table>
    <tr><th>Typ</th><th>Durchmesser</th></tr>
    <tr><td>SR 2:1</td><td>1,6 mm</td></tr>
  </table>
  <a href="/produkte/schrumpfschlauch/sr-2-1">SR 2:1 Detail</a>
</main></body></html>
"""


def test_normalise_whitespace() -> None:
    assert normalise_whitespace("  a\n\t b   c ") == "a b c"


def test_extract_contact_info_parses_impressum() -> None:
    soup = BeautifulSoup(IMPRESSUM_HTML, "html.parser")
    info = extract_contact_info(soup, "https://www.bit-gmbh.de/impressum")

    assert info.company_name == "BIT Bierther GmbH"
    assert "info@bit-gmbh.de" in info.emails
    assert any("228 123456" in p for p in info.phones)
    assert any("228 123457" in f for f in info.fax)
    assert info.vat_id == "DE123456789"
    assert info.register_number == "HRB 12345"
    assert info.managing_directors == ["Max Bierther"]
    assert any("53111 Bonn" in line for line in info.address_lines)


def test_extract_tables_and_links() -> None:
    soup = BeautifulSoup(CATALOG_HTML, "html.parser")

    tables = extract_tables(soup)
    assert tables == [[["Typ", "Durchmesser"], ["SR 2:1", "1,6 mm"]]]

    links = extract_links(soup, "https://www.bit-gmbh.de/")
    assert {"text": "SR 2:1 Detail", "url": "https://www.bit-gmbh.de/produkte/schrumpfschlauch/sr-2-1"} in links
