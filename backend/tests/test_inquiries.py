from __future__ import annotations

import uuid
from decimal import Decimal

import pytest

from app.database import get_sessionmaker
from app.models.ai_analysis import AIAnalysis
from app.models.price_item import PriceItem, PriceItemKind
from app.models.price_list import PriceList
from app.schemas.ai import AIAnalysisResult, DetectedService


@pytest.mark.asyncio
async def test_create_inquiry_attach_ai_then_generate_quote(
    two_companies, client_factory
) -> None:
    user_id = two_companies["user_a_id"]
    company_id = two_companies["company_a_id"]

    async with client_factory(user_id, company_id) as client:
        r = await client.post(
            "/api/v1/inquiries",
            json={
                "title": "Bad sanieren",
                "description": "Fliesen austauschen, Wand streichen.",
                "contact_email": "kunde@example.com",
            },
        )
        assert r.status_code == 201, r.text
        inquiry = r.json()
        inquiry_id = uuid.UUID(inquiry["id"])

    sm = get_sessionmaker()
    async with sm() as session:
        pl = PriceList(company_id=company_id, name="Standard", is_default=True)
        session.add(pl)
        await session.flush()
        session.add_all(
            [
                PriceItem(
                    company_id=company_id,
                    price_list_id=pl.id,
                    key="tile_floor",
                    label="Bodenfliesen verlegen",
                    kind=PriceItemKind.AREA,
                    unit="qm",
                    unit_price=Decimal("55.00"),
                ),
                PriceItem(
                    company_id=company_id,
                    price_list_id=pl.id,
                    key="paint_wall",
                    label="Wand streichen",
                    kind=PriceItemKind.AREA,
                    unit="qm",
                    unit_price=Decimal("12.00"),
                ),
            ]
        )

        result = AIAnalysisResult(
            rooms=["Bad"],
            materials=["Fliesen", "Wandfarbe"],
            damages=["alte Fliesen"],
            detected_services=[
                DetectedService(key="tile_floor", label="Fliesen", unit="qm",
                                quantity_estimate=10.0, confidence=0.9),
                DetectedService(key="paint_wall", label="Wand", unit="qm",
                                quantity_estimate=20.0, confidence=0.8),
                DetectedService(key="unknown_service", label="Sonstiges", unit="stk",
                                quantity_estimate=1.0, confidence=0.4),
            ],
            notes=None,
        )
        session.add(
            AIAnalysis(
                company_id=company_id,
                inquiry_id=inquiry_id,
                model="test-mock",
                result=result.model_dump(),
            )
        )
        await session.commit()

    async with client_factory(user_id, company_id) as client:
        r = await client.post(
            f"/api/v1/quotes/from-inquiry/{inquiry_id}",
            json={"price_list_id": str(pl.id)},
        )
        assert r.status_code == 201, r.text
        quote = r.json()
        assert quote["needs_pricing"] is True
        assert Decimal(quote["subtotal"]) == Decimal("790.00")
        assert Decimal(quote["vat_amount"]) == Decimal("150.10")
        assert Decimal(quote["total"]) == Decimal("940.10")
        assert len(quote["positions"]) == 3
        unknown = next(p for p in quote["positions"] if p["item_key"] == "unknown_service")
        assert unknown["needs_pricing"] is True
        assert unknown["unit_price"] is None


@pytest.mark.asyncio
async def test_generate_quote_without_analysis_fails(two_companies, client_factory) -> None:
    user_id = two_companies["user_a_id"]
    company_id = two_companies["company_a_id"]
    async with client_factory(user_id, company_id) as client:
        r = await client.post("/api/v1/inquiries", json={"title": "Ohne KI"})
        assert r.status_code == 201
        iid = r.json()["id"]
        r = await client.post(f"/api/v1/quotes/from-inquiry/{iid}", json={})
        assert r.status_code == 422
