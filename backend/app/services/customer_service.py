from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.repositories.customer_repo import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: AsyncSession, company_id: uuid.UUID) -> None:
        self.db = db
        self.company_id = company_id
        self.repo = CustomerRepository(db, company_id)

    async def create(self, payload: CustomerCreate) -> Customer:
        customer = Customer(
            company_id=self.company_id,
            full_name=payload.full_name,
            email=str(payload.email) if payload.email else None,
            phone=payload.phone,
            address_line1=payload.address_line1,
            address_line2=payload.address_line2,
            postal_code=payload.postal_code,
            city=payload.city,
            country=payload.country,
            notes=payload.notes,
        )
        return await self.repo.add(customer)

    async def update(self, customer_id: uuid.UUID, payload: CustomerUpdate) -> Customer:
        customer = await self.repo.get_or_404(customer_id)
        data = payload.model_dump(exclude_unset=True)
        if "email" in data and data["email"] is not None:
            data["email"] = str(data["email"])
        for field, value in data.items():
            setattr(customer, field, value)
        await self.db.flush()
        return customer

    async def list(self, *, limit: int = 100, offset: int = 0) -> tuple[list[Customer], int]:
        items = await self.repo.list(limit=limit, offset=offset)
        total = await self.repo.count()
        return items, total

    async def get(self, customer_id: uuid.UUID) -> Customer:
        return await self.repo.get_or_404(customer_id)

    async def delete(self, customer_id: uuid.UUID) -> None:
        customer = await self.repo.get_or_404(customer_id)
        await self.repo.delete(customer)
