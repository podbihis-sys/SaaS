from __future__ import annotations

from app.models.customer import Customer
from app.repositories.base import TenantRepository


class CustomerRepository(TenantRepository[Customer]):
    model = Customer
