"""What counts as a booking system, and what only looks like one.

The catalogue is built by fingerprinting URLs, so a signature that is a
character too loose invents offices and one a character too tight loses them.
Both directions have already happened here, each time on a scale nobody
noticed until the totals were counted:

* ``/select2`` without a guard matched ``…/vendor/select2/select2.css`` and
  labelled several hundred municipalities as TEVIS instances that had no
  mandants to enumerate;
* ``terminvereinbarung/termin`` matched any CMS page filed under
  "Online-Terminvereinbarung/Terminbuchung" and put fourteen municipalities on
  Berlin's software;
* ``buergerservice-portal.de`` missed the live spelling without the hyphen and
  lost 144 links to the Bavarian portal.

Every case below is a real URL taken from the survey output.
"""

from __future__ import annotations

import pytest

from scripts.sniff_portals import classify

# (url, expected vendor) — real links from the survey.
RECOGNISED = [
    # The hyphenless spelling is the live host; both must resolve to one vendor.
    ("https://www.buergerserviceportal.de/bayern/landshut/home", "bayern-portal"),
    ("https://www.buergerservice-portal.de/bayern/kelheim/", "bayern-portal"),
    (
        "https://www.buergerserviceportal.de/bayern/lkrberchtesgadenerland/bsp-ikfz",
        "bayern-portal",
    ),
    # Berlin's ZMS, which is the only thing that may carry that name.
    ("https://service.berlin.de/terminvereinbarung/termin/day/", "berlin_zms"),
    ("https://service.berlin.de/terminvereinbarung/", "berlin_zms"),
    # TEVIS, hosted and on-premise.
    ("https://termine.stadt-koeln.de/select2?md=1", "tevis"),
    ("https://landkreis-lueneburg.termine-reservieren.online/", "tevis"),
    # Vendors the survey kept meeting with no name to give them.
    ("https://cm-terminreservierung.de/geislingen-an-der-steige?calendarId=57", "cm-termin"),
    ("https://www.terminplaner-online.de/stadt_karben/buergerhaus_okarben/", "terminplaner-online"),
    ("https://module.bookingtime.com/booking/organization/f6PYgZoXHTU8", "bookingtime"),
    ("https://satellite.booking-time.com/?key=85e84e33bc9febf3", "bookingtime"),
    ("http://www.terminland.eu/otzberg", "terminland"),
    ("https://www.terminland.de/musterstadt", "terminland"),
    ("https://www.termine-regional.de", "termine-regional"),
    ("https://koeln.smartcjm.com/m/buergeramt/extern/calendar/?uid=x", "smartcjm"),
    ("https://www.bonn.de/m/3/extern/calendar/?uid=abc", "smartcjm"),
]

# Pages that mention appointments but do not take them. Each of these was
# wrongly catalogued as an office before the signature that matched it was
# tightened.
NOT_A_BOOKING_SYSTEM = [
    # The jQuery Select2 widget, shipped by half the web.
    "https://www.example.de/css/vendor/select2/select2.css",
    "https://www.example.de/js/select2.min.js",
    # CMS pages whose *path* reads like Berlin's booking route.
    "https://www.coburg.de/rathaus-und-verwaltung/terminvereinbarung/termin-vereinbaren.php",
    "https://www.quedlinburg.de/Rathaus/Online-Terminvereinbarung/Terminbuchung/",
    "https://www.saterland.de/Online-Services/Online-Terminvereinbarung/Terminbuchung/",
    "https://www.treuchtlingen.de/service/terminvereinbarung/terminvereinbarung-standesamt",
]


@pytest.mark.parametrize(("url", "vendor"), RECOGNISED)
def test_known_booking_urls_are_recognised(url: str, vendor: str) -> None:
    assert classify(url)[0] == vendor


@pytest.mark.parametrize("url", NOT_A_BOOKING_SYSTEM)
def test_pages_that_merely_mention_appointments_are_not_vendors(url: str) -> None:
    assert classify(url)[0] is None


def test_a_vendor_is_only_claimed_as_supported_if_an_adapter_exists() -> None:
    """``supported`` drives scanning, so a wrong True polls a system blind.

    The newly named vendors are link-only: the catalogue records where the
    authority takes appointments, and nothing polls them until somebody writes
    the adapter.
    """
    for url in (
        "https://cm-terminreservierung.de/x",
        "https://www.terminplaner-online.de/x",
        "https://module.bookingtime.com/x",
        "https://www.termine-regional.de",
        "https://www.buergerserviceportal.de/bayern/landshut/home",
    ):
        assert classify(url)[1] is False
