from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.errors import NotFound, ValidationError
from app.core.geo import bounding_box, haversine_km
from app.deps import SessionDep
from app.models.enums import AuthorityType, ServiceCategory
from app.models.office import Office, Service
from app.providers.taxonomy import CATEGORY_LABELS_DE
from app.schemas.catalog import CategoryOut, OfficeOut
from app.schemas.common import Page

router = APIRouter(prefix="/offices", tags=["catalog"])


@router.get("", response_model=Page[OfficeOut])
async def list_offices(
    session: SessionDep,
    q: Annotated[str | None, Query(max_length=120, description="Name, city or postal code")] = None,
    city: Annotated[str | None, Query(max_length=120)] = None,
    postal_code: Annotated[str | None, Query(max_length=10)] = None,
    category: Annotated[ServiceCategory | None, Query()] = None,
    authority_type: Annotated[AuthorityType | None, Query()] = None,
    latitude: Annotated[float | None, Query(ge=-90, le=90)] = None,
    longitude: Annotated[float | None, Query(ge=-180, le=180)] = None,
    radius_km: Annotated[float, Query(gt=0, le=200)] = 25.0,
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> Page[OfficeOut]:
    """Find offices, optionally near a point and offering a given errand."""
    if (latitude is None) != (longitude is None):
        raise ValidationError("latitude and longitude must be given together")

    statement = select(Office).where(Office.active.is_(True))

    if q:
        pattern = f"%{q.strip()}%"
        statement = statement.where(
            Office.name.ilike(pattern) | Office.city.ilike(pattern) | Office.postal_code.ilike(pattern)
        )
    if city:
        statement = statement.where(Office.city.ilike(f"%{city.strip()}%"))
    if postal_code:
        statement = statement.where(Office.postal_code == postal_code.strip())
    if authority_type:
        statement = statement.where(Office.authority_type == authority_type)
    if category:
        statement = statement.where(
            Office.id.in_(
                select(Service.office_id).where(
                    Service.category == category, Service.active.is_(True)
                )
            )
        )
    if latitude is not None and longitude is not None:
        lat_min, lat_max, lon_min, lon_max = bounding_box(latitude, longitude, radius_km)
        statement = statement.where(
            Office.latitude.between(lat_min, lat_max),
            Office.longitude.between(lon_min, lon_max),
        )

    statement = statement.options(selectinload(Office.services))

    if latitude is not None and longitude is not None:
        # The box above is a coarse prefilter; the exact radius has to be applied
        # in Python because the distance is not expressible in portable SQL.
        candidates = (await session.execute(statement)).scalars().all()
        scored: list[tuple[float, Office]] = []
        for office in candidates:
            if office.latitude is None or office.longitude is None:
                continue
            distance = haversine_km(latitude, longitude, office.latitude, office.longitude)
            if distance <= radius_km:
                scored.append((distance, office))
        scored.sort(key=lambda pair: pair[0])
        total = len(scored)
        window = scored[offset : offset + limit]
        items = []
        for distance, office in window:
            out = OfficeOut.model_validate(office)
            out.distance_km = round(distance, 2)
            items.append(out)
        return Page[OfficeOut](items=items, total=total, limit=limit, offset=offset)

    total = await session.scalar(
        select(func.count()).select_from(statement.order_by(None).subquery())
    )
    rows = (
        await session.execute(statement.order_by(Office.city, Office.name).limit(limit).offset(offset))
    ).scalars().all()
    return Page[OfficeOut](
        items=[OfficeOut.model_validate(o) for o in rows],
        total=total or 0,
        limit=limit,
        offset=offset,
    )


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(session: SessionDep) -> list[CategoryOut]:
    """The errand list the app opens with, ordered by how widely it is offered."""
    rows = (
        await session.execute(
            select(Service.category, func.count(func.distinct(Service.office_id)))
            .join(Office, Office.id == Service.office_id)
            .where(Service.active.is_(True), Office.active.is_(True))
            .group_by(Service.category)
        )
    ).all()
    counts = {ServiceCategory(row[0]): row[1] for row in rows}
    return sorted(
        (
            CategoryOut(
                value=category,
                label_de=CATEGORY_LABELS_DE.get(category, category.value),
                office_count=counts.get(category, 0),
            )
            for category in counts
        ),
        key=lambda c: (-c.office_count, c.label_de),
    )


@router.get("/{office_id}", response_model=OfficeOut)
async def get_office(office_id: uuid.UUID, session: SessionDep) -> Office:
    office = (
        await session.execute(
            select(Office).where(Office.id == office_id).options(selectinload(Office.services))
        )
    ).scalar_one_or_none()
    if office is None:
        raise NotFound("Office not found")
    return office
