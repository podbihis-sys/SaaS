from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_company_id, get_db
from app.repositories.company_repo import CompanyRepository
from app.repositories.customer_repo import CustomerRepository
from app.schemas.common import Paged, PageMeta
from app.schemas.quote import GenerateQuoteRequest, QuoteRead, QuoteUpdate
from app.services.pdf_service import PDFService
from app.services.quote_service import QuoteService

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.get("", response_model=Paged[QuoteRead])
async def list_quotes(
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
) -> Paged[QuoteRead]:
    service = QuoteService(db, company_id)
    items, total = await service.list(limit=page_size, offset=(page - 1) * page_size)
    return Paged[QuoteRead](
        items=[QuoteRead.model_validate(q) for q in items],
        meta=PageMeta(total=total, page=page, page_size=page_size),
    )


@router.post(
    "/from-inquiry/{inquiry_id}",
    response_model=QuoteRead,
    status_code=status.HTTP_201_CREATED,
)
async def generate_from_inquiry(
    inquiry_id: uuid.UUID,
    payload: GenerateQuoteRequest,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> QuoteRead:
    service = QuoteService(db, company_id)
    quote = await service.generate_from_inquiry(
        inquiry_id,
        price_list_id=payload.price_list_id,
        title_override=payload.title,
        notes=payload.notes,
    )
    return QuoteRead.model_validate(quote)


@router.get("/{quote_id}", response_model=QuoteRead)
async def get_quote(
    quote_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> QuoteRead:
    service = QuoteService(db, company_id)
    q = await service.get(quote_id)
    return QuoteRead.model_validate(q)


@router.patch("/{quote_id}", response_model=QuoteRead)
async def update_quote(
    quote_id: uuid.UUID,
    payload: QuoteUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> QuoteRead:
    service = QuoteService(db, company_id)
    quote = await service.get(quote_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(quote, field, value)
    await db.flush()
    return QuoteRead.model_validate(quote)


@router.get("/{quote_id}/pdf")
async def quote_pdf(
    quote_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> Response:
    service = QuoteService(db, company_id)
    quote = await service.get(quote_id)
    companies = CompanyRepository(db)
    company = await companies.get_or_404(company_id)
    cs = await companies.get_settings(company_id)

    customer_block: dict[str, str | None] = {}
    if quote.customer_id:
        customer_repo = CustomerRepository(db, company_id)
        customer = await customer_repo.get(quote.customer_id)
        if customer is not None:
            customer_block = {
                "full_name": customer.full_name,
                "address_line1": customer.address_line1,
                "postal_code": customer.postal_code,
                "city": customer.city,
            }

    pdf_service = PDFService()
    pdf_bytes = pdf_service.render_quote_pdf(
        quote=quote, company=company, settings_obj=cs, customer_block=customer_block
    )
    filename = pdf_service.build_filename(quote.id, quote.number)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
