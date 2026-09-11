"""The general-portal fallback: what a place with no typed office still offers."""

from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Municipality, Office
from app.models.enums import AuthorityType, Provider
from app.services.places import link_offices, responsibilities, seed_municipalities
from tests.test_places import REGISTER


@pytest.fixture
async def register(session: AsyncSession) -> dict:
    await seed_municipalities(session, REGISTER)
    return REGISTER


def _portal(city: str, name: str, authority: AuthorityType, state: str = "Nordrhein-Westfalen") -> Office:
    return Office(
        provider=Provider.PORTAL,
        external_id=f"portal-{city}".lower(),
        base_url="https://termine.example.de",
        name=name,
        authority_type=authority,
        city=city,
        state=state,
        booking_url="https://termine.example.de/",
        scan_enabled=False,
        scan_blocked_reason="Kein Adapter",
    )


async def test_a_towns_portal_answers_every_municipal_errand(session: AsyncSession, register: dict) -> None:
    session.add(_portal("Odenthal", "Terminvergabe Odenthal", AuthorityType.BUERGERAMT))
    await session.flush()
    await link_offices(session)

    odenthal = await session.get(Municipality, "05378024")
    assert odenthal is not None
    by_type = {r.authority_type: r for r in await responsibilities(session, odenthal)}

    # The portal is the Bürgeramt outright, and stands in for the other
    # municipal errands, which no separate office covers.
    assert [o.name for o in by_type[AuthorityType.BUERGERAMT].offices] == ["Terminvergabe Odenthal"]
    standesamt = by_type[AuthorityType.STANDESAMT]
    assert [o.name for o in standesamt.offices] == ["Terminvergabe Odenthal"]
    assert standesamt.note == "Allgemeines Terminportal der Gemeinde"
    # Not for what the Kreis handles: that portal is somebody else's.
    assert by_type[AuthorityType.KFZ_ZULASSUNGSSTELLE].offices == []


async def test_the_districts_portal_answers_the_districts_errands(
    session: AsyncSession, register: dict
) -> None:
    # Filed on the seat municipality, as build_portal_catalog does, and typed
    # "Weitere Ämter" because it is not the seat's citizens' office.
    session.add(
        _portal(
            "Bergisch Gladbach",
            "Terminvergabe Rheinisch-Bergischer Kreis (Kreisverwaltung)",
            AuthorityType.SONSTIGES,
        )
    )
    await session.flush()
    await link_offices(session)

    odenthal = await session.get(Municipality, "05378024")
    assert odenthal is not None
    by_type = {r.authority_type: r for r in await responsibilities(session, odenthal)}

    kfz = by_type[AuthorityType.KFZ_ZULASSUNGSSTELLE]
    assert kfz.level == "kreis"
    assert [o.name for o in kfz.offices] == ["Terminvergabe Rheinisch-Bergischer Kreis (Kreisverwaltung)"]
    assert kfz.note == "Allgemeines Terminportal des Kreises"
    # The neighbouring district's portal is not Odenthal's Bürgeramt.
    assert by_type[AuthorityType.BUERGERAMT].offices == []


async def test_a_neighbours_town_portal_is_never_offered(session: AsyncSession, register: dict) -> None:
    """Bergisch Gladbach's own portal does not register Odenthal's cars.

    Both towns sit in the same Kreis, so the district-level lookup sees the
    neighbour's portal. Offering it would send someone to a Bürgerbüro that
    does not do the errand at all.
    """
    session.add(
        _portal("Bergisch Gladbach", "Terminvergabe Bergisch Gladbach", AuthorityType.BUERGERAMT)
    )
    await session.flush()
    await link_offices(session)

    odenthal = await session.get(Municipality, "05378024")
    assert odenthal is not None
    by_type = {r.authority_type: r for r in await responsibilities(session, odenthal)}
    assert by_type[AuthorityType.KFZ_ZULASSUNGSSTELLE].offices == []
    assert by_type[AuthorityType.BUERGERAMT].offices == []


async def test_a_real_office_beats_the_general_portal(session: AsyncSession, register: dict) -> None:
    session.add(_portal("Odenthal", "Terminvergabe Odenthal", AuthorityType.BUERGERAMT))
    session.add(
        Office(
            provider=Provider.TEVIS,
            external_id="tevis-odenthal-md1",
            base_url="https://termine.odenthal.de",
            name="Standesamt Odenthal",
            authority_type=AuthorityType.STANDESAMT,
            city="Odenthal",
            state="Nordrhein-Westfalen",
        )
    )
    await session.flush()
    await link_offices(session)

    odenthal = await session.get(Municipality, "05378024")
    assert odenthal is not None
    by_type = {r.authority_type: r for r in await responsibilities(session, odenthal)}
    standesamt = by_type[AuthorityType.STANDESAMT]
    assert [o.name for o in standesamt.offices] == ["Standesamt Odenthal"]
    assert standesamt.note is None
