from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_company_id, get_db
from app.schemas.common import Paged, PageMeta
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=Paged[CustomerRead])
async def list_customers(
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=200),
) -> Paged[CustomerRead]:
    service = CustomerService(db, company_id)
    items, total = await service.list(limit=page_size, offset=(page - 1) * page_size)
    return Paged[CustomerRead](
        items=[CustomerRead.model_validate(c) for c in items],
        meta=PageMeta(total=total, page=page, page_size=page_size),
    )


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CustomerRead:
    service = CustomerService(db, company_id)
    c = await service.create(payload)
    return CustomerRead.model_validate(c)


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CustomerRead:
    service = CustomerService(db, company_id)
    c = await service.get(customer_id)
    return CustomerRead.model_validate(c)


@router.patch("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> CustomerRead:
    service = CustomerService(db, company_id)
    c = await service.update(customer_id, payload)
    return CustomerRead.model_validate(c)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = CustomerService(db, company_id)
    await service.delete(customer_id)
