from __future__ import annotations

import json

import httpx
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Municipality, Office, PostalCode, PostalCodeLookup
from app.models.enums import AuthorityType, Provider
from app.services import places
from app.services.places import (
    link_offices,
    register_rows,
    resolve,
    responsibilities,
    seed_municipalities,
)

#: A miniature register in the exact shape ``scripts/import_gv100ad.py`` writes.
REGISTER = {
    "stand": "2026-06-30",
    "fields": ["ags", "verband", "name", "short_name", "kind", "area_ha", "population", "plz", "plz_multi"],
    "kinds": {"61": "Kreisfreie Stadt", "63": "Stadt", "64": "Kreisangehörige Gemeinde"},
    "laender": {"05": "Nordrhein-Westfalen", "09": "Bayern"},
    "kreise": {
        "05111": {"name": "Düsseldorf, Stadt", "seat": "Düsseldorf", "kind": "41"},
        "05378": {"name": "Rheinisch-Bergischer Kreis", "seat": "Bergisch Gladbach", "kind": "43"},
        "05515": {"name": "Münster, Stadt", "seat": "Münster", "kind": "41"},
        "09779": {"name": "Donau-Ries", "seat": "Donauwörth", "kind": "44"},
    },
    "gemeinden": [
        ["05111000", "0000", "Düsseldorf, Stadt", "Düsseldorf", "61", 21730, 640000, "40213", True],
        [
            "05378004",
            "0000",
            "Bergisch Gladbach, Stadt",
            "Bergisch Gladbach",
            "63",
            8300,
            112000,
            "51465",
            True,
        ],
        ["05378024", "0000", "Odenthal", "Odenthal", "64", 3960, 15000, "51519", False],
        ["05515000", "0000", "Münster, Stadt", "Münster", "61", 30328, 308000, "48143", True],
        ["09779187", "5725", "Münster", "Münster", "64", 1772, 1228, "86692", True],
        [
            "03403000",
            "0000",
            "Oldenburg (Oldb), Stadt",
            "Oldenburg (Oldb)",
            "61",
            10300,
            172000,
            "26122",
            True,
        ],
        [
            "01055032",
            "0000",
            "Oldenburg in Holstein, Stadt",
            "Oldenburg in Holstein",
            "63",
            3900,
            9800,
            "23758",
            False,
        ],
    ],
}


@pytest.fixture
async def register(session: AsyncSession) -> dict:
    await seed_municipalities(session, REGISTER)
    return REGISTER


def _office(
    city: str, name: str, authority: AuthorityType, state: str | None = "Nordrhein-Westfalen"
) -> Office:
    return Office(
        provider=Provider.DEMO,
        external_id=f"demo-{city}-{name}".lower().replace(" ", "-"),
        base_url="https://demo.invalid",
        name=name,
        authority_type=authority,
        city=city,
        state=state,
    )


async def test_register_rows_carry_district_and_state() -> None:
    rows = {r["ags"]: r for r in register_rows(REGISTER)}
    odenthal = rows["05378024"]
    assert odenthal["district_ags"] == "05378"
    assert odenthal["district_name"] == "Rheinisch-Bergischer Kreis"
    assert odenthal["district_seat"] == "Bergisch Gladbach"
    assert odenthal["state"] == "Nordrhein-Westfalen"
    # A kreisfreie Stadt is its own district.
    assert rows["05111000"]["district_name"] == "Düsseldorf, Stadt"


async def test_seed_is_idempotent_and_writes_seat_postcodes(session: AsyncSession) -> None:
    created, updated = await seed_municipalities(session, REGISTER)
    assert (created, updated) == (7, 0)
    created, updated = await seed_municipalities(session, REGISTER)
    assert (created, updated) == (0, 7)
    codes = (await session.execute(select(PostalCode).where(PostalCode.plz == "51519"))).scalars().all()
    assert [(c.ags, c.source) for c in codes] == [("05378024", "gv100ad")]


async def test_resolve_by_name_prefers_the_big_city(session: AsyncSession, register: dict) -> None:
    hits = await resolve(session, "münster")
    assert [h.municipality.ags for h in hits] == ["05515000", "09779187"]
    assert hits[0].municipality.state == "Nordrhein-Westfalen"
    # A fragment inside the name still finds it when no name starts with it.
    hits = await resolve(session, "gladbach")
    assert [h.municipality.short_name for h in hits] == ["Bergisch Gladbach"]


async def test_resolve_by_postcode_from_the_register(session: AsyncSession, register: dict) -> None:
    hits = await resolve(session, "51519")
    assert len(hits) == 1
    assert hits[0].municipality.short_name == "Odenthal"
    assert hits[0].matched_plz == "51519"
    assert hits[0].localities == ["Odenthal"]
    assert await resolve(session, "99999") == []
    # With the external source off nothing is recorded as looked up.
    assert (await session.execute(select(PostalCodeLookup))).scalars().all() == []


async def test_postcode_is_completed_from_openplz_once(
    session: AsyncSession, register: dict, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request.url.params["postalCode"])
        # 51519 also reaches into Bergisch Gladbach (Herrenstrunden), which the
        # register's seat postcodes cannot know.
        return httpx.Response(
            200,
            json=[
                {"postalCode": "51519", "name": "Odenthal", "municipality": {"key": "05378024"}},
                {"postalCode": "51519", "name": "Bergisch Gladbach", "municipality": {"key": "05378004"}},
                {"postalCode": "51519", "name": "Nirgendwo", "municipality": {"key": "05999999"}},
            ],
        )

    def fake_client() -> httpx.AsyncClient:
        return httpx.AsyncClient(transport=httpx.MockTransport(handler))

    monkeypatch.setattr(settings, "OPENPLZ_ENABLED", True)
    monkeypatch.setattr(places, "build_client", fake_client)

    hits = await resolve(session, "51519")
    assert [h.municipality.short_name for h in hits] == ["Bergisch Gladbach", "Odenthal"]
    assert hits[1].localities == ["Odenthal"]
    # The unknown key was skipped rather than dangling.
    assert {h.municipality.ags for h in hits} == {"05378004", "05378024"}

    await resolve(session, "51519")
    assert calls == ["51519"]
    lookup = await session.get(PostalCodeLookup, "51519")
    assert lookup is not None and lookup.hits == 3


async def test_openplz_outage_is_not_remembered_as_a_miss(
    session: AsyncSession, register: dict, monkeypatch: pytest.MonkeyPatch
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("down")

    monkeypatch.setattr(settings, "OPENPLZ_ENABLED", True)
    monkeypatch.setattr(
        places, "build_client", lambda: httpx.AsyncClient(transport=httpx.MockTransport(handler))
    )
    hits = await resolve(session, "51519")
    assert [h.municipality.short_name for h in hits] == ["Odenthal"]
    assert await session.get(PostalCodeLookup, "51519") is None


async def test_link_offices_uses_state_then_population(session: AsyncSession, register: dict) -> None:
    session.add_all(
        [
            _office("Münster", "Bürgeramt Mitte", AuthorityType.BUERGERAMT),
            _office("Münster", "Rathaus", AuthorityType.BUERGERAMT, state="Bayern"),
            _office("Münster", "Ohne Land", AuthorityType.BUERGERAMT, state=None),
            _office("Atlantis", "Bürgeramt", AuthorityType.BUERGERAMT),
            # Registered as "Oldenburg (Oldb)"; the city itself never says so.
            _office("Oldenburg", "Bürgerbüro", AuthorityType.BUERGERAMT, state="Niedersachsen"),
        ]
    )
    await session.flush()
    unmatched = await link_offices(session)
    assert [o.city for o in unmatched] == ["Atlantis"]
    by_name = {o.name: o.municipality_ags for o in (await session.execute(select(Office))).scalars()}
    assert by_name["Bürgeramt Mitte"] == "05515000"
    assert by_name["Rathaus"] == "09779187"
    assert by_name["Ohne Land"] == "05515000"
    assert by_name["Bürgeramt"] is None
    assert by_name["Bürgerbüro"] == "03403000"


async def test_responsibilities_split_between_gemeinde_and_kreis(
    session: AsyncSession, register: dict
) -> None:
    session.add_all(
        [
            _office("Bergisch Gladbach", "Straßenverkehrsamt Rhein-Berg", AuthorityType.KFZ_ZULASSUNGSSTELLE),
            _office("Bergisch Gladbach", "Bürgerbüro", AuthorityType.BUERGERAMT),
            _office("Düsseldorf", "Bürgerbüro Bilk", AuthorityType.BUERGERAMT),
        ]
    )
    await session.flush()
    await link_offices(session)

    odenthal = await session.get(Municipality, "05378024")
    assert odenthal is not None
    by_type = {r.authority_type: r for r in await responsibilities(session, odenthal)}

    kfz = by_type[AuthorityType.KFZ_ZULASSUNGSSTELLE]
    assert kfz.level == "kreis"
    assert kfz.responsible_name == "Rheinisch-Bergischer Kreis (Sitz: Bergisch Gladbach)"
    assert [o.name for o in kfz.offices] == ["Straßenverkehrsamt Rhein-Berg"]

    buergeramt = by_type[AuthorityType.BUERGERAMT]
    assert buergeramt.level == "gemeinde"
    assert buergeramt.responsible_name == "Odenthal"
    # The neighbouring town's Bürgerbüro is not Odenthal's.
    assert buergeramt.offices == []

    assert by_type[AuthorityType.FINANZAMT].level == "region"

    duesseldorf = await session.get(Municipality, "05111000")
    assert duesseldorf is not None
    for r in await responsibilities(session, duesseldorf):
        assert r.level == ("region" if r.authority_type in places.REGION_LEVEL else "gemeinde")


async def test_places_api(client: AsyncClient, session: AsyncSession, register: dict) -> None:
    session.add(_office("Odenthal", "Bürgerbüro Odenthal", AuthorityType.BUERGERAMT))
    await session.flush()
    await link_offices(session)

    response = await client.get("/api/v1/places", params={"q": "51519"})
    assert response.status_code == 200, response.text
    body = response.json()
    assert len(body) == 1
    assert body[0]["short_name"] == "Odenthal"
    assert body[0]["matched_plz"] == "51519"
    assert body[0]["kind_label"] == "Kreisangehörige Gemeinde"
    assert body[0]["office_count"] == 1
    assert body[0]["is_kreisfrei"] is False

    response = await client.get("/api/v1/places/05378024", params={"authority_type": "buergeramt"})
    assert response.status_code == 200, response.text
    detail = response.json()
    assert detail["place"]["ags"] == "05378024"
    assert len(detail["responsibilities"]) == 1
    entry = detail["responsibilities"][0]
    assert entry["level"] == "gemeinde"
    assert entry["label_de"].startswith("Bürgeramt")
    assert [o["name"] for o in entry["offices"]] == ["Bürgerbüro Odenthal"]

    response = await client.get("/api/v1/places/00000000")
    assert response.status_code == 404

    response = await client.get("/api/v1/places", params={"q": ""})
    assert response.status_code == 422


def test_shipped_register_is_complete() -> None:
    """The committed register is the real thing: every Land, every Kreis, all Gemeinden."""
    data = json.loads(places.REGISTER_PATH.read_text(encoding="utf-8"))
    assert len(data["laender"]) == 16
    assert len(data["kreise"]) >= 400
    assert len(data["gemeinden"]) >= 10_500
    rows = register_rows(data)
    assert all(r["state"] for r in rows)
    assert all(r["district_name"] for r in rows)
    berlin = next(r for r in rows if r["ags"] == "11000000")
    assert berlin["short_name"] == "Berlin" and berlin["kind"] == "61"
