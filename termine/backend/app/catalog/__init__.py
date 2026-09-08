from __future__ import annotations

from app.catalog.bremen import BREMEN_OFFICES
from app.catalog.offices import CATALOG as BASE_CATALOG
from app.catalog.offices import DEMO_SERVICES
from app.catalog.tevis_cities import TEVIS_CITY_OFFICES

#: Everything the seeder loads: the hand-written base entries plus each
#: catalogue produced by a discovery script.
CATALOG: list[dict] = [*BASE_CATALOG, *BREMEN_OFFICES, *TEVIS_CITY_OFFICES]

__all__ = ["BASE_CATALOG", "BREMEN_OFFICES", "CATALOG", "DEMO_SERVICES", "TEVIS_CITY_OFFICES"]
