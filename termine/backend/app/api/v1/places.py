from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.core.errors import NotFound
from app.deps import SessionDep
from app.models.enums import AuthorityType
from app.models.place import Municipality
from app.schemas.catalog import OfficeOut
from app.schemas.places import PlaceDetailOut, PlaceOut, ResponsibilityOut
from app.services import places
from app.services.places import AUTHORITY_LABELS_DE, PlaceHit, load_register

router = APIRouter(prefix="/places", tags=["places"])


def _place_out(hit: PlaceHit, office_count: int) -> PlaceOut:
    m = hit.municipality
    return PlaceOut(
        ags=m.ags,
        name=m.name,
        short_name=m.short_name,
        kind=m.kind,
        kind_label=load_register()["kinds"].get(m.kind, ""),
        population=m.population,
        plz=m.plz,
        district_name=m.district_name,
        district_seat=m.district_seat,
        state=m.state,
        is_kreisfrei=m.is_kreisfrei,
        matched_plz=hit.matched_plz,
        localities=hit.localities,
        office_count=office_count,
    )


@router.get("", response_model=list[PlaceOut])
async def search_places(
    session: SessionDep,
    q: Annotated[str, Query(min_length=1, max_length=80, description="Postleitzahl oder Ortsname")],
    limit: Annotated[int, Query(ge=1, le=25)] = 10,
) -> list[PlaceOut]:
    """Municipalities matching a postcode or the start of a town name."""
    hits = await places.resolve(session, q, limit=limit)
    counts = await places.office_counts(session, [h.municipality.ags for h in hits])
    return [_place_out(hit, counts.get(hit.municipality.ags, 0)) for hit in hits]


@router.get("/{ags}", response_model=PlaceDetailOut)
async def place_detail(
    ags: str,
    session: SessionDep,
    authority_type: Annotated[AuthorityType | None, Query()] = None,
) -> PlaceDetailOut:
    """Who is responsible for each errand in this municipality, and the offices for it."""
    municipality = await session.get(Municipality, ags)
    if municipality is None:
        raise NotFound("Gemeinde nicht gefunden")
    counts = await places.office_counts(session, [ags])
    found = await places.responsibilities(session, municipality, authority_type)
    return PlaceDetailOut(
        place=_place_out(PlaceHit(municipality), counts.get(ags, 0)),
        responsibilities=[
            ResponsibilityOut(
                authority_type=r.authority_type,
                label_de=AUTHORITY_LABELS_DE[r.authority_type],
                level=r.level,  # type: ignore[arg-type]
                responsible_name=r.responsible_name,
                note=r.note,
                offices=[OfficeOut.model_validate(o) for o in r.offices],
            )
            for r in found
        ],
    )
