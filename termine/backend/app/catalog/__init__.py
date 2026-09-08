from __future__ import annotations

from app.catalog.bremen import BREMEN_OFFICES
from app.catalog.offices import CATALOG as BASE_CATALOG
from app.catalog.offices import DEMO_SERVICES
from app.catalog.portals import PORTAL_OFFICES
from app.catalog.tevis_cities import TEVIS_CITY_OFFICES

#: Everything the seeder loads: the hand-written base entries plus each
#: catalogue produced by a discovery script. Portals come last so that a city
#: whose offices are known in detail keeps those entries; the portal row is a
#: separate office (provider ``portal``) and never replaces them.
CATALOG: list[dict] = [*BASE_CATALOG, *BREMEN_OFFICES, *TEVIS_CITY_OFFICES, *PORTAL_OFFICES]

__all__ = [
    "BASE_CATALOG",
    "BREMEN_OFFICES",
    "CATALOG",
    "DEMO_SERVICES",
    "PORTAL_OFFICES",
    "TEVIS_CITY_OFFICES",
]
