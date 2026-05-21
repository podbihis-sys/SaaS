from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from app.models.price_item import PriceItem
from app.schemas.ai import DetectedService
from app.schemas.quote import QuoteDraft, QuotePositionDraft

TWOPLACES = Decimal("0.01")


def _round(amount: Decimal) -> Decimal:
    return amount.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


@dataclass(frozen=True, slots=True)
class PricedPosition:
    item_key: str | None
    label: str
    unit: str
    quantity: Decimal
    unit_price: Decimal | None
    line_total: Decimal | None
    needs_pricing: bool
    notes: str | None


def price_detected_services(
    services: list[DetectedService],
    catalog: Mapping[str, PriceItem],
) -> list[PricedPosition]:
    """Map AI-detected services to priced positions using the company catalog.

    If a service key is not present in the catalog, the position is marked
    needs_pricing=True with unit_price/line_total=None. Never invents prices.
    """
    positions: list[PricedPosition] = []
    for svc in services:
        qty = Decimal(str(svc.quantity_estimate))
        item = catalog.get(svc.key)
        if item is None:
            positions.append(
                PricedPosition(
                    item_key=svc.key,
                    label=svc.label,
                    unit=svc.unit,
                    quantity=qty,
                    unit_price=None,
                    line_total=None,
                    needs_pricing=True,
                    notes=f"Kein Katalogpreis für '{svc.key}'",
                )
            )
            continue

        unit_price = Decimal(str(item.unit_price))
        line_total = _round(unit_price * qty)
        positions.append(
            PricedPosition(
                item_key=svc.key,
                label=item.label or svc.label,
                unit=item.unit or svc.unit,
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
                needs_pricing=False,
                notes=None,
            )
        )
    return positions


def build_quote_draft(
    *,
    title: str,
    currency: str,
    vat_rate: Decimal,
    positions: list[PricedPosition],
) -> QuoteDraft:
    """Compute subtotal, VAT, total from priced positions. Pure function."""
    subtotal = Decimal("0.00")
    needs_pricing = False
    draft_positions: list[QuotePositionDraft] = []

    for p in positions:
        if p.needs_pricing or p.line_total is None:
            needs_pricing = True
        else:
            subtotal += p.line_total
        draft_positions.append(
            QuotePositionDraft(
                item_key=p.item_key,
                label=p.label,
                unit=p.unit,
                quantity=p.quantity,
                unit_price=p.unit_price,
                needs_pricing=p.needs_pricing,
                notes=p.notes,
            )
        )

    subtotal = _round(subtotal)
    vat_amount = _round(subtotal * Decimal(str(vat_rate)))
    total = _round(subtotal + vat_amount)

    return QuoteDraft(
        title=title,
        currency=currency,
        vat_rate=Decimal(str(vat_rate)),
        positions=draft_positions,
        subtotal=subtotal,
        vat_amount=vat_amount,
        total=total,
        needs_pricing=needs_pricing,
    )


def compose_quote(
    *,
    title: str,
    currency: str,
    vat_rate: Decimal,
    services: list[DetectedService],
    catalog: Mapping[str, PriceItem],
) -> QuoteDraft:
    """Convenience: detected services + catalog -> QuoteDraft."""
    priced = price_detected_services(services, catalog)
    return build_quote_draft(
        title=title, currency=currency, vat_rate=vat_rate, positions=priced
    )
