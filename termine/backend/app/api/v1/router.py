from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import auth, bookings, health, notifications, offices, slots, watches

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(offices.router)
api_router.include_router(slots.router)
api_router.include_router(watches.router)
api_router.include_router(notifications.router)
api_router.include_router(bookings.router)
