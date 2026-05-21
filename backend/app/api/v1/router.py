from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import ai, auth, companies, customers, health, inquiries, prices, quotes

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(companies.router)
api_router.include_router(customers.router)
api_router.include_router(inquiries.router)
api_router.include_router(ai.router)
api_router.include_router(prices.router)
api_router.include_router(quotes.router)
