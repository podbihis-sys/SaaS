"""Postcode or town → municipality → responsible authority.

The user types "51519" or "Odenthal" and expects to land at the office that
will actually serve them. Three facts make that possible, and each comes from
a different place:

1. Which Gemeinde a name or postcode denotes — the official register
   (GV100AD, ``app/data/gv100ad.json``) for names and seat postcodes, the
   OpenPLZ API for the remaining postcodes, fetched once and remembered.
2. Which *level* handles the errand. A kreisfreie Stadt does everything
   itself. A kreisangehörige Gemeinde registers residents and marries people,
   but vehicles, driving licences and foreigners' matters belong to its Kreis.
3. Which offices in the catalogue belong to that level — every office carries
   the AGS of the Gemeinde it sits in, linked by the seeder.

Where the catalogue has no office for the responsible authority yet, the
answer still names it: "Kreis Mettmann, Sitz Mettmann" is more useful than
"nothing found".
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

import httpx
from sqlalchemy import func, insert, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.logging_config import get_logger
from app.models.enums import AuthorityType
from app.models.office import Office
from app.models.place import Municipality, PostalCode, PostalCodeLookup
from app.providers.base import build_client

log = get_logger(__name__)

REGISTER_PATH = Path(__file__).resolve().parent.parent / "data" / "gv100ad.json"

_PLZ_RE = re.compile(r"^\d{5}$")

AUTHORITY_LABELS_DE: dict[AuthorityType, str] = {
    AuthorityType.BUERGERAMT: "Bürgeramt / Einwohnermeldeamt",
    AuthorityType.AUSLAENDERBEHOERDE: "Ausländerbehörde",
    AuthorityType.KFZ_ZULASSUNGSSTELLE: "Kfz-Zulassungsstelle",
    AuthorityType.FUEHRERSCHEINSTELLE: "Führerscheinstelle",
    AuthorityType.STANDESAMT: "Standesamt",
    AuthorityType.GEWERBEAMT: "Gewerbeamt",
    AuthorityType.JOBCENTER: "Jobcenter",
    AuthorityType.FINANZAMT: "Finanzamt",
    AuthorityType.SONSTIGES: "Weitere Ämter",
}

#: Errands a Gemeinde that belongs to a Kreis does *not* handle itself: these
#: sit with the Landkreis (Kreisverwaltung / Landratsamt). Larger
#: kreisangehörige Städte — große Kreisstädte, mittlere kreisangehörige Städte
#: in NRW — often run their own, which is why the lookup tries the town first.
KREIS_LEVEL = frozenset(
    {
        AuthorityType.KFZ_ZULASSUNGSSTELLE,
        AuthorityType.FUEHRERSCHEINSTELLE,
        AuthorityType.AUSLAENDERBEHOERDE,
    }
)
#: Errands every Gemeinde handles itself.
GEMEINDE_LEVEL = frozenset({AuthorityType.BUERGERAMT, AuthorityType.STANDESAMT, AuthorityType.GEWERBEAMT})
#: Not municipal at all — Jobcenter and Finanzamt have their own districts
#: (GV-ISys carries those keys; they are not modelled yet).
REGION_LEVEL = frozenset({AuthorityType.JOBCENTER, AuthorityType.FINANZAMT})

#: The order the app shows errands in.
AUTHORITIES_IN_ORDER: tuple[AuthorityType, ...] = (
    AuthorityType.BUERGERAMT,
    AuthorityType.KFZ_ZULASSUNGSSTELLE,
    AuthorityType.FUEHRERSCHEINSTELLE,
    AuthorityType.AUSLAENDERBEHOERDE,
    AuthorityType.STANDESAMT,
    AuthorityType.GEWERBEAMT,
    AuthorityType.JOBCENTER,
    AuthorityType.FINANZAMT,
    # Last, so an office the taxonomy could not place is still reachable.
    AuthorityType.SONSTIGES,
)


# --- Register --------------------------------------------------------------


@lru_cache(maxsize=1)
def load_register(path: Path = REGISTER_PATH) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def register_rows(register: dict) -> list[dict]:
    """The register's compact arrays as ``Municipality`` column dicts."""
    fields = register["fields"]
    kreise = register["kreise"]
    laender = register["laender"]
    rows = []
    for values in register["gemeinden"]:
        entry = dict(zip(fields, values, strict=True))
        district_ags = entry["ags"][:5]
        kreis = kreise.get(district_ags, {})
        rows.append(
            {
                "ags": entry["ags"],
                "name": entry["name"],
                "short_name": entry["short_name"],
                "kind": entry["kind"],
                "population": entry["population"],
                "area_ha": entry["area_ha"],
                "plz": entry["plz"],
                "plz_multi": entry["plz_multi"],
                "district_ags": district_ags,
                "district_name": kreis.get("name") or entry["name"],
                "district_seat": kreis.get("seat") or None,
                "state_key": entry["ags"][:2],
                "state": laender.get(entry["ags"][:2], ""),
                "register_stand": register.get("stand"),
            }
        )
    return rows


async def seed_municipalities(session: AsyncSession, register: dict | None = None) -> tuple[int, int]:
    """Upsert the register into ``municipalities`` and its seat postcodes.

    Idempotent; a new quarterly extract updates every row in place. Returns
    (created, updated).
    """
    rows = register_rows(register or load_register())
    existing = set((await session.execute(select(Municipality.ags))).scalars().all())
    new = [r for r in rows if r["ags"] not in existing]
    old = [r for r in rows if r["ags"] in existing]
    if new:
        await session.execute(insert(Municipality), new)
    if old:
        await session.execute(update(Municipality), old)

    known = set(
        (
            await session.execute(
                select(PostalCode.plz, PostalCode.ags).where(PostalCode.source == "gv100ad")
            )
        ).all()
    )
    seats = [
        {"plz": r["plz"], "ags": r["ags"], "locality": r["short_name"], "source": "gv100ad"}
        for r in rows
        if r["plz"] and (r["plz"], r["ags"]) not in known
    ]
    if seats:
        await session.execute(insert(PostalCode), seats)
    await session.flush()
    return len(new), len(old)


# --- Linking offices --------------------------------------------------------


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


async def link_offices(session: AsyncSession, *, relink: bool = False) -> list[Office]:
    """Give every office the AGS of the Gemeinde its ``city`` names.

    Match on the register's short name, preferring the office's own state and
    then the larger municipality: "Münster" in Nordrhein-Westfalen is the city,
    "Münster" without a state is still the city and not the Bavarian village.
    Returns the offices that could not be matched, so the caller can say so.
    """
    statement = select(Office)
    if not relink:
        statement = statement.where(Office.municipality_ags.is_(None))
    offices = (await session.execute(statement)).scalars().all()
    if not offices:
        return []

    wanted = {_norm(o.city) for o in offices}
    candidates = (
        (await session.execute(select(Municipality).where(func.lower(Municipality.short_name).in_(wanted))))
        .scalars()
        .all()
    )
    by_name: dict[str, list[Municipality]] = {}
    for m in candidates:
        by_name.setdefault(_norm(m.short_name), []).append(m)

    def pick(office: Office, options: list[Municipality]) -> Municipality | None:
        if office.state:
            same_state = [m for m in options if _norm(m.state) == _norm(office.state)]
            options = same_state or options
        return max(options, key=lambda m: m.population) if options else None

    unmatched: list[Office] = []
    for office in offices:
        match = pick(office, by_name.get(_norm(office.city), []))
        if match is None:
            unmatched.append(office)
            continue
        office.municipality_ags = match.ags

    # Second pass: the register qualifies some names that nobody qualifies in
    # everyday use — "Oldenburg (Oldb)", "Halle (Saale)". Match the name before
    # the bracket; state and size still decide between "Halle (Saale)" and
    # "Halle (Westf.)".
    if unmatched:
        patterns = [f"{_norm(o.city)} (%" for o in unmatched]
        qualified = (
            (
                await session.execute(
                    select(Municipality).where(
                        or_(*[func.lower(Municipality.short_name).like(p) for p in patterns])
                    )
                )
            )
            .scalars()
            .all()
        )
        by_base: dict[str, list[Municipality]] = {}
        for m in qualified:
            by_base.setdefault(_norm(m.short_name.split(" (", 1)[0]), []).append(m)
        still: list[Office] = []
        for office in unmatched:
            match = pick(office, by_base.get(_norm(office.city), []))
            if match is None:
                still.append(office)
                continue
            office.municipality_ags = match.ags
        unmatched = still

    await session.flush()
    return unmatched


# --- Resolving -------------------------------------------------------------


@dataclass
class PlaceHit:
    municipality: Municipality
    matched_plz: str | None = None
    localities: list[str] = field(default_factory=list)


def looks_like_plz(query: str) -> bool:
    return bool(_PLZ_RE.match(query.strip()))


async def resolve(session: AsyncSession, query: str, *, limit: int = 10) -> list[PlaceHit]:
    """Municipalities matching a postcode or (the start of) a name."""
    query = query.strip()
    if not query:
        return []
    if looks_like_plz(query):
        return await resolve_plz(session, query)

    pattern = f"{query.lower()}%"
    statement = (
        select(Municipality)
        .where(func.lower(Municipality.short_name).like(pattern))
        .order_by(Municipality.population.desc(), Municipality.short_name)
        .limit(limit)
    )
    rows = (await session.execute(statement)).scalars().all()
    if not rows and len(query) >= 3:
        # "Gladbach" should still find Bergisch Gladbach and Mönchengladbach.
        statement = (
            select(Municipality)
            .where(func.lower(Municipality.short_name).like(f"%{query.lower()}%"))
            .order_by(Municipality.population.desc(), Municipality.short_name)
            .limit(limit)
        )
        rows = (await session.execute(statement)).scalars().all()
    return [PlaceHit(m) for m in rows]


async def resolve_plz(session: AsyncSession, plz: str) -> list[PlaceHit]:
    """Every municipality a postcode reaches into, largest first."""
    await complete_postcode(session, plz)
    rows = (
        await session.execute(
            select(PostalCode, Municipality)
            .join(Municipality, Municipality.ags == PostalCode.ags)
            .where(PostalCode.plz == plz)
            .order_by(Municipality.population.desc())
        )
    ).all()
    hits: dict[str, PlaceHit] = {}
    for code, municipality in rows:
        hit = hits.setdefault(municipality.ags, PlaceHit(municipality, matched_plz=plz))
        if code.locality not in hit.localities:
            hit.localities.append(code.locality)
    return list(hits.values())


async def complete_postcode(session: AsyncSession, plz: str) -> None:
    """Fetch the postcode's mappings from OpenPLZ once, if allowed to."""
    if not settings.OPENPLZ_ENABLED:
        return
    if await session.get(PostalCodeLookup, plz) is not None:
        return
    try:
        mappings = await fetch_openplz(plz)
    except httpx.HTTPError as exc:
        # Answer from the register and try again next time; a transient
        # outage must not be remembered as "this postcode does not exist".
        log.warning("places.openplz_unavailable", plz=plz, error=type(exc).__name__)
        return

    existing = set(
        (
            await session.execute(select(PostalCode.ags, PostalCode.locality).where(PostalCode.plz == plz))
        ).all()
    )
    known_ags = set(
        (
            await session.execute(
                select(Municipality.ags).where(Municipality.ags.in_({m["ags"] for m in mappings}))
            )
        )
        .scalars()
        .all()
    )
    for mapping in mappings:
        if mapping["ags"] not in known_ags:
            # A key the register does not know (a merger newer than the
            # extract, or a data error upstream) would dangle; skip it.
            log.info("places.openplz_unknown_ags", plz=plz, ags=mapping["ags"])
            continue
        if (mapping["ags"], mapping["locality"]) in existing:
            continue
        session.add(
            PostalCode(plz=plz, ags=mapping["ags"], locality=mapping["locality"], source="openplzapi")
        )
        existing.add((mapping["ags"], mapping["locality"]))
    session.add(PostalCodeLookup(plz=plz, hits=len(mappings)))
    await session.flush()


async def fetch_openplz(plz: str) -> list[dict]:
    """``[{"ags", "locality"}]`` for a postcode, from the OpenPLZ API.

    One small request per postcode, ever. The API is open data (its own
    sources are OpenStreetMap and Destatis) and returns 404 for an unknown
    postcode, which is a legitimate "no such postcode", not an error.
    """
    url = f"{settings.OPENPLZ_API_URL.rstrip('/')}/de/Localities"
    async with build_client() as client:
        response = await client.get(url, params={"postalCode": plz}, timeout=10.0)
    if response.status_code == 404:
        return []
    response.raise_for_status()
    mappings = []
    for row in response.json():
        key = (row.get("municipality") or {}).get("key")
        locality = row.get("name")
        if key and locality and row.get("postalCode") == plz:
            mappings.append({"ags": key, "locality": locality})
    return mappings


async def office_counts(session: AsyncSession, ags_list: list[str]) -> dict[str, int]:
    if not ags_list:
        return {}
    rows = (
        await session.execute(
            select(Office.municipality_ags, func.count())
            .where(Office.municipality_ags.in_(ags_list), Office.active.is_(True))
            .group_by(Office.municipality_ags)
        )
    ).all()
    return {ags: count for ags, count in rows}


# --- Responsibility --------------------------------------------------------


@dataclass
class Responsibility:
    authority_type: AuthorityType
    level: str
    responsible_name: str
    offices: list[Office]
    note: str | None = None


def level_for(municipality: Municipality, authority_type: AuthorityType) -> str:
    if authority_type in REGION_LEVEL:
        return "region"
    if municipality.is_kreisfrei or authority_type in GEMEINDE_LEVEL:
        return "gemeinde"
    if authority_type in KREIS_LEVEL:
        return "kreis"
    return "gemeinde"


async def responsibilities(
    session: AsyncSession,
    municipality: Municipality,
    authority_type: AuthorityType | None = None,
) -> list[Responsibility]:
    """Who serves this place for each errand, with the catalogue offices for it."""
    wanted = [authority_type] if authority_type else list(AUTHORITIES_IN_ORDER)

    # All catalogue offices of the Gemeinde and of its Kreis, in one query;
    # the per-errand split below is done in memory.
    district_members = select(Municipality.ags).where(Municipality.district_ags == municipality.district_ags)
    offices = (
        (
            await session.execute(
                select(Office)
                .where(Office.active.is_(True), Office.municipality_ags.in_(district_members))
                .order_by(Office.city, Office.name)
            )
        )
        .scalars()
        .all()
    )
    own = [o for o in offices if o.municipality_ags == municipality.ags]

    result: list[Responsibility] = []
    for kind in wanted:
        level = level_for(municipality, kind)
        note = None
        if level == "gemeinde":
            name = municipality.name
            found = [o for o in own if o.authority_type == kind]
        elif level == "kreis":
            name = municipality.district_name
            if municipality.district_seat:
                name = f"{name} (Sitz: {municipality.district_seat})"
            # A large kreisangehörige Stadt may run its own; prefer that.
            found = [o for o in own if o.authority_type == kind] or [
                o for o in offices if o.authority_type == kind
            ]
            if municipality.kind in ("63", "67"):
                note = (
                    "Zuständig ist grundsätzlich der Kreis; größere kreisangehörige Städte "
                    "führen teils eigene Stellen."
                )
        else:
            name = f"{AUTHORITY_LABELS_DE[kind]} für {municipality.short_name}"
            note = "Eigener Bezirk, nicht an die Gemeinde gebunden; Zuordnung noch nicht hinterlegt."
            found = [o for o in offices if o.authority_type == kind]
        result.append(Responsibility(kind, level, name, found, note))
    return result
