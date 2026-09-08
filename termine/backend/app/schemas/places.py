from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.models.enums import AuthorityType
from app.schemas.catalog import OfficeOut


class PlaceOut(BaseModel):
    """A municipality as a search result."""

    ags: str
    name: str
    short_name: str
    kind: str
    kind_label: str
    population: int
    #: Postcode of the administrative seat.
    plz: str | None = None
    district_name: str
    district_seat: str | None = None
    state: str
    is_kreisfrei: bool
    #: When the query was a postcode: the postcode that matched, and the
    #: localities it covers inside this municipality.
    matched_plz: str | None = None
    localities: list[str] = Field(default_factory=list)
    #: Offices from the catalogue that sit in this municipality.
    office_count: int = 0


class ResponsibilityOut(BaseModel):
    authority_type: AuthorityType
    label_de: str
    #: Which level of government handles this errand for the place.
    level: Literal["gemeinde", "kreis", "region"]
    #: The authority that is responsible, by name — even when the catalogue
    #: holds no office for it yet.
    responsible_name: str
    note: str | None = None
    offices: list[OfficeOut] = Field(default_factory=list)


class PlaceDetailOut(BaseModel):
    place: PlaceOut
    responsibilities: list[ResponsibilityOut]
