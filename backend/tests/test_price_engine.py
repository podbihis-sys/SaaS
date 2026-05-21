from __future__ import annotations

import uuid
from decimal import Decimal

from app.models.price_item import PriceItem, PriceItemKind
from app.schemas.ai import DetectedService
from app.services.price_engine import compose_quote, price_detected_services


def _item(key: str, unit: str, price: str, kind: PriceItemKind = PriceItemKind.AREA) -> PriceItem:
    return PriceItem(
        id=uuid.uuid4(),
        company_id=uuid.uuid4(),
        price_list_id=uuid.uuid4(),
        key=key,
        label=key.replace("_", " ").title(),
        kind=kind,
        unit=unit,
        unit_price=Decimal(price),
        currency="EUR",
    )


def test_simple_quote_math() -> None:
    services = [
        DetectedService(key="paint_wall", label="Wand streichen", unit="qm",
                        quantity_estimate=20.0, confidence=0.9),
        DetectedService(key="labor", label="Arbeit", unit="h",
                        quantity_estimate=4.0, confidence=0.8),
    ]
    catalog = {
        "paint_wall": _item("paint_wall", "qm", "12.50"),
        "labor": _item("labor", "h", "65.00", PriceItemKind.LABOR),
    }
    draft = compose_quote(
        title="Anstrich Wohnzimmer",
        currency="EUR",
        vat_rate=Decimal("0.19"),
        services=services,
        catalog=catalog,
    )
    assert draft.subtotal == Decimal("510.00")
    assert draft.vat_amount == Decimal("96.90")
    assert draft.total == Decimal("606.90")
    assert draft.needs_pricing is False
    assert len(draft.positions) == 2


def test_missing_price_marks_position_needs_pricing() -> None:
    services = [
        DetectedService(key="known", label="known", unit="qm",
                        quantity_estimate=10.0, confidence=1.0),
        DetectedService(key="unknown", label="unknown", unit="stk",
                        quantity_estimate=3.0, confidence=0.5),
    ]
    catalog = {"known": _item("known", "qm", "10.00")}

    positions = price_detected_services(services, catalog)
    assert positions[0].needs_pricing is False
    assert positions[0].line_total == Decimal("100.00")
    assert positions[1].needs_pricing is True
    assert positions[1].unit_price is None
    assert positions[1].line_total is None

    draft = compose_quote(
        title="t", currency="EUR", vat_rate=Decimal("0.19"),
        services=services, catalog=catalog,
    )
    assert draft.needs_pricing is True
    assert draft.subtotal == Decimal("100.00")
    assert draft.vat_amount == Decimal("19.00")
    assert draft.total == Decimal("119.00")


def test_rounding_half_up() -> None:
    services = [
        DetectedService(key="x", label="x", unit="qm",
                        quantity_estimate=1.0, confidence=1.0),
    ]
    catalog = {"x": _item("x", "qm", "10.005")}
    draft = compose_quote(
        title="t", currency="EUR", vat_rate=Decimal("0.19"),
        services=services, catalog=catalog,
    )
    assert draft.subtotal == Decimal("10.01")
    assert draft.vat_amount == Decimal("1.90")
    assert draft.total == Decimal("11.91")


def test_zero_vat() -> None:
    services = [
        DetectedService(key="x", label="x", unit="qm",
                        quantity_estimate=5.0, confidence=1.0),
    ]
    catalog = {"x": _item("x", "qm", "20.00")}
    draft = compose_quote(
        title="t", currency="EUR", vat_rate=Decimal("0.00"),
        services=services, catalog=catalog,
    )
    assert draft.subtotal == Decimal("100.00")
    assert draft.vat_amount == Decimal("0.00")
    assert draft.total == Decimal("100.00")


def test_empty_services() -> None:
    draft = compose_quote(
        title="leer", currency="EUR", vat_rate=Decimal("0.19"),
        services=[], catalog={},
    )
    assert draft.subtotal == Decimal("0.00")
    assert draft.total == Decimal("0.00")
    assert draft.needs_pricing is False
    assert draft.positions == []
