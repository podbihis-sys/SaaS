# Booking system adapters

Germany has no national appointment system. Every state, district and city
procures its own, so covering the country means one adapter per vendor family
plus a hand-maintained catalogue of which office runs which system.

## Verification status

This is the honest state of each adapter. "Verified" means the identifiers and
parsing have been checked against the live system by a human.

| Adapter | Vendor | Typical users | Access | Status |
| --- | --- | --- | --- | --- |
| `demo` | – | – | local only | **Verified.** Synthetic provider, contacts nothing. Default in dev and the only one enabled in CI. |
| `berlin_zms` | ZMS (Berlin) | service.berlin.de | HTML scraping | **Unverified.** Implemented against ZMS's documented two-step flow and covered by fixture tests. Needs a live check before `active: true`. |
| `tevis` | TEVIS | Köln, Bonn, Frankfurt, much of NRW/Hesse | HTML scraping | **Unverified.** Same caveat. |
| `netappoint` | netAppoint (nubit) | Kiel, Lübeck, Schleswig-Holstein | HTML scraping | **Unverified.** Same caveat. |
| `etermin` | eTermin | smaller municipalities | documented JSON API, key-gated | **Unverified.** Needs an API key issued by the authority; without one the office is skipped rather than scraped. |

Every catalogue entry outside `demo` is seeded with `active: false`. Turning one
on is a deliberate act that should follow the checks in
[`legal.md`](./legal.md).

## The adapter contract

`app/providers/base.py`:

```python
class AppointmentProvider(ABC):
    key: Provider
    min_request_interval: float        # seconds between requests to one host
    min_scan_interval_seconds: int     # seconds between scans of one pair

    async def discover_services(client, office) -> list[RawService]
    async def fetch_slots(client, office, service, date_from, date_to) -> list[RawSlot]
    def booking_url(office, service, slot) -> str
```

Adapters are stateless. Everything specific to one city arrives through the
office's `base_url` and its `provider_meta` JSON blob.

## Two rules that matter more than the parsing

**Never return an empty list when you are broken.** A scanner that reports "no
appointments" when it has actually failed is worse than one that reports an
error: nobody notices, watches silently stop firing, and the failure surfaces
weeks later as "the app doesn't work any more". Every adapter checks that the
page still looks like what it expects and raises `ProviderError` if it does not.
`scan_pair` then records the failure, backs off, and — importantly — leaves
existing slots alone rather than marking them gone.

**Parse what is stable, not what is pretty.** CSS class names get renamed in
redesigns without warning. URL shapes and visible clock times do not. So days
are found by their link shape and times by a clock pattern, with class names
used only as a secondary filter. `extract_bookable_dates` goes one step further:
if no element carries any of the expected vendor classes, it degrades to "check
every day in the window" rather than "nothing is free".

## Adding an adapter

1. Subclass `AppointmentProvider` in `app/providers/`, register it in
   `app/providers/__init__.py`, add the key to `Provider` in
   `app/models/enums.py`.
2. Capture a real calendar page and a real day page into `tests/fixtures/`.
   Strip anything identifying; keep the structure.
3. Write tests that cover: normal parsing, the requested date window, a page
   whose shape has changed (must raise), and a transport failure (must raise).
4. Add catalogue entries in `app/catalog/offices.py` with `active: false`.
5. Verify against the live system by hand, at a polite rate, then flip `active`
   and add the provider key to `SCANNER_PROVIDERS`.

Reuse `app/providers/html_utils.py` for the parsing — the vendors differ far
more in their URL schemes than in how they render a day.

## Service taxonomy

Authorities name the same errand a dozen ways. `app/providers/taxonomy.py`
normalises free-text labels onto `ServiceCategory`, so a user can watch
"Personalausweis" across several cities at once without knowing that one city
calls it *Personalausweis beantragen* and the next *Beantragung eines
Personalausweises*.

The ordering of the pattern list is load-bearing: `Abmeldung einer Wohnung` and
`Fahrzeug abmelden` share a word but are unrelated errands, so the vehicle
patterns are tested first. Patterns use lookaheads rather than `A.*B`, because
German puts the words in either order.
