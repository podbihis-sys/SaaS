from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFound, ValidationError
from app.models.ai_analysis import AIAnalysis
from app.models.quote import Quote, QuoteStatus
from app.models.quote_position import QuotePosition
from app.repositories.company_repo import CompanyRepository
from app.repositories.inquiry_repo import InquiryRepository
from app.repositories.price_repo import PriceItemRepository, PriceListRepository
from app.repositories.quote_repo import QuoteRepository
from app.schemas.ai import AIAnalysisResult, DetectedService
from app.schemas.quote import QuoteDraft
from app.services.price_engine import compose_quote


class QuoteService:
    def __init__(self, db: AsyncSession, company_id: uuid.UUID) -> None:
        self.db = db
        self.company_id = company_id
        self.quotes = QuoteRepository(db, company_id)
        self.lists = PriceListRepository(db, company_id)
        self.items = PriceItemRepository(db, company_id)
        self.inquiries = InquiryRepository(db, company_id)
        self.companies = CompanyRepository(db)

    async def _build_number(self) -> str:
        cs = await self.companies.get_settings(self.company_id)
        prefix = cs.quote_number_prefix if cs else "AN-"
        counter = cs.quote_number_counter if cs else 1
        if cs is not None:
            cs.quote_number_counter = counter + 1
            await self.db.flush()
        return f"{prefix}{counter:05d}"

    async def _resolve_price_list(self, price_list_id: uuid.UUID | None) -> uuid.UUID | None:
        if price_list_id is not None:
            pl = await self.lists.get_or_404(price_list_id)
            return pl.id
        default = await self.lists.get_default()
        if default is not None:
            return default.id
        first = await self.lists.first()
        return first.id if first else None

    async def generate_from_inquiry(
        self,
        inquiry_id: uuid.UUID,
        *,
        price_list_id: uuid.UUID | None = None,
        title_override: str | None = None,
        notes: str | None = None,
    ) -> Quote:
        inquiry = await self.inquiries.get_or_404(inquiry_id)
        analysis: AIAnalysis | None = await self.inquiries.latest_analysis(inquiry_id)
        if analysis is None:
            raise ValidationError("Inquiry has no AI analysis yet")

        result = AIAnalysisResult.model_validate(analysis.result)
        services: list[DetectedService] = result.detected_services

        list_id = await self._resolve_price_list(price_list_id)
        catalog = {}
        if list_id is not None:
            catalog = await self.items.by_keys(list_id, [s.key for s in services])

        cs = await self.companies.get_settings(self.company_id)
        vat_rate = Decimal(str(cs.vat_rate)) if cs else Decimal("0.19")
        currency = cs.currency if cs else "EUR"

        draft: QuoteDraft = compose_quote(
            title=title_override or inquiry.title,
            currency=currency,
            vat_rate=vat_rate,
            services=services,
            catalog=catalog,
        )

        number = await self._build_number()
        quote = Quote(
            company_id=self.company_id,
            inquiry_id=inquiry.id,
            customer_id=inquiry.customer_id,
            number=number,
            title=draft.title,
            status=QuoteStatus.DRAFT,
            currency=draft.currency,
            vat_rate=draft.vat_rate,
            subtotal=draft.subtotal,
            vat_amount=draft.vat_amount,
            total=draft.total,
            needs_pricing=draft.needs_pricing,
            notes=notes,
        )
        await self.quotes.add(quote)

        for idx, p in enumerate(draft.positions, start=1):
            qp = QuotePosition(
                company_id=self.company_id,
                quote_id=quote.id,
                position=idx,
                item_key=p.item_key,
                label=p.label,
                unit=p.unit,
                quantity=p.quantity,
                unit_price=p.unit_price,
                line_total=(
                    None
                    if p.unit_price is None
                    else (p.unit_price * p.quantity).quantize(Decimal("0.01"))
                ),
                needs_pricing=p.needs_pricing,
                notes=p.notes,
            )
            await self.quotes.add_position(qp)

        return await self.quotes.get_with_positions(quote.id)

    async def get(self, quote_id: uuid.UUID) -> Quote:
        return await self.quotes.get_with_positions(quote_id)

    async def list(self, *, limit: int = 100, offset: int = 0) -> tuple[list[Quote], int]:
        items = await self.quotes.list_with_positions(limit=limit, offset=offset)
        total = await self.quotes.count()
        return items, total

    async def set_status(self, quote_id: uuid.UUID, status: QuoteStatus) -> Quote:
        quote = await self.quotes.get_or_404(quote_id)
        if quote is None:
            raise NotFound(f"Quote {quote_id} not found")
        quote.status = status
        await self.db.flush()
        return await self.quotes.get_with_positions(quote_id)
