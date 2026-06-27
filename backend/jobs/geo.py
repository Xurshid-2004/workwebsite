"""Portable geo helpers for "jobs near me".

Strategy that scales without PostGIS:
  1. Pre-filter with an indexed bounding box (cheap, uses the lat/lng index).
  2. Annotate an exact great-circle distance with Django ORM math functions
     (registered on both SQLite and PostgreSQL), then order/filter by it.

This keeps distance ranking in the database and pagination-friendly, while the
bounding box keeps the candidate set small even with millions of rows.
"""
from __future__ import annotations

import math

from django.db.models import F, QuerySet
from django.db.models.functions import ACos, Cos, Least, Radians, Sin

EARTH_RADIUS_KM = 6371.0


def bounding_box(lat: float, lng: float, radius_km: float):
    """Return (min_lat, max_lat, min_lng, max_lng) covering the radius."""
    lat_delta = radius_km / 111.045  # ~km per degree of latitude
    cos_lat = math.cos(math.radians(lat)) or 1e-9
    lng_delta = radius_km / (111.045 * abs(cos_lat))
    return (lat - lat_delta, lat + lat_delta, lng - lng_delta, lng + lng_delta)


def annotate_distance(qs: QuerySet, lat: float, lng: float) -> QuerySet:
    """Annotate each row with `distance` (km) from (lat, lng).

    Spherical law of cosines. `Least(cosine, 1.0)` guards against tiny
    floating-point values > 1 that would make ACos produce NaN at ~0 distance.
    """
    lat_rad = math.radians(lat)
    lng_rad = math.radians(lng)
    cosine = (
        math.sin(lat_rad) * Sin(Radians(F('location_lat')))
        + math.cos(lat_rad) * Cos(Radians(F('location_lat'))) * Cos(Radians(F('location_lng')) - lng_rad)
    )
    distance = ACos(Least(cosine, 1.0)) * EARTH_RADIUS_KM
    return qs.annotate(distance=distance)


def filter_nearby(qs: QuerySet, lat: float, lng: float, radius_km: float) -> QuerySet:
    """Bounding-box pre-filter + exact distance annotation, ordered nearest-first."""
    min_lat, max_lat, min_lng, max_lng = bounding_box(lat, lng, radius_km)
    qs = qs.filter(
        location_lat__isnull=False,
        location_lng__isnull=False,
        location_lat__gte=min_lat,
        location_lat__lte=max_lat,
        location_lng__gte=min_lng,
        location_lng__lte=max_lng,
    )
    return annotate_distance(qs, lat, lng).filter(distance__lte=radius_km).order_by('distance')
