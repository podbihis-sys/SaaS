from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

EARTH_RADIUS_KM = 6371.0088


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometres.

    Straight-line distance is the right measure here: it decides which offices
    to show, not how long the tram takes.
    """
    lat1_r, lat2_r = radians(lat1), radians(lat2)
    d_lat = lat2_r - lat1_r
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2) ** 2 + cos(lat1_r) * cos(lat2_r) * sin(d_lon / 2) ** 2
    return 2 * EARTH_RADIUS_KM * asin(sqrt(a))


def bounding_box(lat: float, lon: float, radius_km: float) -> tuple[float, float, float, float]:
    """Latitude/longitude box that fully contains the radius.

    Used to narrow the SQL scan before the exact haversine filter runs in
    Python, so a radius search does not read the whole office table.
    """
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / max(111.0 * cos(radians(lat)), 1e-6)
    return (lat - lat_delta, lat + lat_delta, lon - lon_delta, lon + lon_delta)
