from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_company_id, get_db
from app.models.price_item import PriceItem
from app.models.price_list import PriceList
from app.repositories.price_repo import PriceItemRepository, PriceListRepository
from app.schemas.price import (
    PriceItemCreate,
    PriceItemRead,
    PriceItemUpdate,
    PriceListCreate,
    PriceListRead,
    PriceListUpdate,
)

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/lists", response_model=list[PriceListRead])
async def list_price_lists(
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> list[PriceListRead]:
    repo = PriceListRepository(db, company_id)
    items = await repo.list(limit=500)
    return [PriceListRead.model_validate(i) for i in items]


@router.post("/lists", response_model=PriceListRead, status_code=status.HTTP_201_CREATED)
async def create_price_list(
    payload: PriceListCreate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> PriceListRead:
    repo = PriceListRepository(db, company_id)
    pl = PriceList(
        company_id=company_id,
        name=payload.name,
        is_default=payload.is_default,
        currency=payload.currency,
    )
    await repo.add(pl)
    return PriceListRead.model_validate(pl)


@router.patch("/lists/{list_id}", response_model=PriceListRead)
async def update_price_list(
    list_id: uuid.UUID,
    payload: PriceListUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> PriceListRead:
    repo = PriceListRepository(db, company_id)
    pl = await repo.get_or_404(list_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pl, field, value)
    await db.flush()
    return PriceListRead.model_validate(pl)


@router.get("/lists/{list_id}/items", response_model=list[PriceItemRead])
async def list_items_for_list(
    list_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> list[PriceItemRead]:
    list_repo = PriceListRepository(db, company_id)
    await list_repo.get_or_404(list_id)
    item_repo = PriceItemRepository(db, company_id)
    items = await item_repo.list_for_list(list_id)
    return [PriceItemRead.model_validate(i) for i in items]


@router.post("/items", response_model=PriceItemRead, status_code=status.HTTP_201_CREATED)
async def create_price_item(
    payload: PriceItemCreate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> PriceItemRead:
    list_repo = PriceListRepository(db, company_id)
    await list_repo.get_or_404(payload.price_list_id)
    item_repo = PriceItemRepository(db, company_id)
    pi = PriceItem(
        company_id=company_id,
        price_list_id=payload.price_list_id,
        key=payload.key,
        label=payload.label,
        kind=payload.kind,
        unit=payload.unit,
        unit_price=payload.unit_price,
        currency=payload.currency,
    )
    await item_repo.add(pi)
    return PriceItemRead.model_validate(pi)


@router.patch("/items/{item_id}", response_model=PriceItemRead)
async def update_price_item(
    item_id: uuid.UUID,
    payload: PriceItemUpdate,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> PriceItemRead:
    item_repo = PriceItemRepository(db, company_id)
    pi = await item_repo.get_or_404(item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pi, field, value)
    await db.flush()
    return PriceItemRead.model_validate(pi)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_price_item(
    item_id: uuid.UUID,
    company_id: uuid.UUID = Depends(get_current_company_id),
    db: AsyncSession = Depends(get_db),
) -> None:
    item_repo = PriceItemRepository(db, company_id)
    pi = await item_repo.get_or_404(item_id)
    await item_repo.delete(pi)
