from __future__ import annotations

import uuid

import pytest


@pytest.mark.asyncio
async def test_user_from_company_a_cannot_read_company_b_data(
    two_companies, client_factory
) -> None:
    user_a_id = two_companies["user_a_id"]
    user_b_id = two_companies["user_b_id"]
    company_a_id = two_companies["company_a_id"]
    company_b_id = two_companies["company_b_id"]

    async with client_factory(user_b_id, company_b_id) as client_b:
        r = await client_b.post(
            "/api/v1/customers",
            json={"full_name": "Kunde B", "city": "Hamburg"},
        )
        assert r.status_code == 201, r.text
        customer_b_id = r.json()["id"]

    async with client_factory(user_a_id, company_a_id) as client_a:
        r = await client_a.post(
            "/api/v1/customers", json={"full_name": "Kunde A", "city": "Berlin"}
        )
        assert r.status_code == 201

        r = await client_a.get("/api/v1/customers")
        assert r.status_code == 200
        items = r.json()["items"]
        assert all(it["full_name"] != "Kunde B" for it in items)
        assert any(it["full_name"] == "Kunde A" for it in items)

        r = await client_a.get(f"/api/v1/customers/{customer_b_id}")
        assert r.status_code == 404


@pytest.mark.asyncio
async def test_repository_rejects_cross_tenant_writes(two_companies, db_session) -> None:
    from app.core.errors import TenantMismatch
    from app.models.customer import Customer
    from app.repositories.customer_repo import CustomerRepository

    repo_a = CustomerRepository(db_session, two_companies["company_a_id"])
    bad = Customer(company_id=two_companies["company_b_id"], full_name="Cross")
    with pytest.raises(TenantMismatch):
        await repo_a.add(bad)


@pytest.mark.asyncio
async def test_unknown_id_lookup_returns_404(two_companies, client_factory) -> None:
    user_a_id = two_companies["user_a_id"]
    company_a_id = two_companies["company_a_id"]
    async with client_factory(user_a_id, company_a_id) as c:
        r = await c.get(f"/api/v1/customers/{uuid.uuid4()}")
        assert r.status_code == 404
