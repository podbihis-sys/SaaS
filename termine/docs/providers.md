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
| `tevis` | TEVIS | most municipalities and districts that book online | HTML scraping | **Verified live.** Ten instances sampled across all three deployment shapes; nine returned real appointments. See below. |
| `netappoint` | netAppoint (nubit) | Kiel, Lübeck, Schleswig-Holstein | HTML scraping | **Unverified.** Same caveat. |
| `etermin` | eTermin | smaller municipalities | documented JSON API, key-gated | **Unverified.** Needs an API key issued by the authority; without one the office is skipped rather than scraped. |
| `portal` | any | ~1 municipality in 4 | none — link only | **Not an adapter.** No implementation is registered, so a poll raises rather than silently doing something. See below. |

Every catalogue entry outside `demo` is seeded with `active: false`. Turning one
on is a deliberate act that should follow the checks in
[`legal.md`](./legal.md).

## `portal`: listed, linked, never polled

Most German municipalities run an appointment system we cannot read — either
the vendor has no adapter, or its robots.txt forbids polling, or nobody has
verified the instance. Leaving them out of the catalogue would mean a user
types their postcode and is told there is nothing, when in truth there is a
booking page one tap away.

So they are catalogued as provider `portal`: found, named, tied to their
Gemeindeschlüssel, carrying the official booking URL, and marked
`scan_enabled=False` with a reason the app shows. The user finds the right
authority and books there. Three things keep that honest:

- no adapter is registered for the key, so `get_provider` raises rather than
  inventing behaviour;
- `scan_enabled=False` keeps the pair out of `due_pairs`, so the scanner never
  sees it;
- a watch on such an office is refused by the API with an explanation.

Vendors seen in the survey, none of which has an adapter yet: Terminland,
cleverQ, Tempus, qmatic, timify, smartCJM, nolis, DTMS, meinenTermin,
termin-online-buchen. Adding an adapter for one of them turns its portal rows
into real, watchable offices — that is the intended upgrade path, and the
survey data says which vendor buys the most coverage.

## What verifying TEVIS live changed

The adapter was written from the shape of the URLs and passed its fixture
tests. The first run against a real instance returned "Kein gültiger Standort
gefunden" — every time, for every instance. Three things were wrong, and none
of them could have been found without the live check:

1. **The flow is a session, not a set of URLs.** `/suggest` cannot be requested
   directly, however correct the parameters. The entry page, the location page
   and a `POST` of the chosen branch have to happen in order, carrying cookies.
2. **The mandant in the public URL is not the internal one.** `select2?md=27`
   is a selector; the form on that page submits `mdt=415`. The old code sent
   the public id and got an empty flow.
3. **There is no month calendar.** The instance answers with a bounded list of
   suggestions, each a small form carrying the date as `YYYYMMDD` and the start
   as minutes since midnight. A longer horizon is covered by re-filtering from
   the last day returned, at most three requests.

A tenth instance in the sample could not be read at all: its mandant is
configured to collect name, address and telephone number *before* showing any
appointment. The adapter detects that and raises, because filling the form in
would mean starting a booking on someone's behalf. Those offices stay
link-only.

Cost per scan: three requests for the first page of suggestions, up to three
more for a long horizon, at four seconds between requests to one host.

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
4. Add catalogue entries in `app/catalog/offices.py` with `active: false`, or
   regenerate a data catalogue (`app/data/tevis_offices.json`,
   `app/data/portals.json`) from the discovery scripts.
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
