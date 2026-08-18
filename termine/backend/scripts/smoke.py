"""End-to-end smoke run against the demo provider.

Registers a device, creates a watch, forces a scan cycle and prints what the
user would have been alerted about. Push delivery is disabled, so nothing
leaves the machine.

    DATABASE_URL=... PUSH_ENABLED=false python -m scripts.smoke
"""

from __future__ import annotations

import asyncio

from httpx import ASGITransport, AsyncClient

from app.database import get_sessionmaker
from app.logging_config import configure_logging
from app.main import app
from app.services.scanner import run_scan_cycle


async def main() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://smoke") as client:
        auth = await client.post(
            "/api/v1/auth/device", json={"install_id": "smoke-install-0001", "locale": "de"}
        )
        auth.raise_for_status()
        headers = {"Authorization": f"Bearer {auth.json()['token']}"}
        print(f"authenticated as {auth.json()['user_id']}")

        await client.post(
            "/api/v1/auth/devices",
            headers=headers,
            json={"push_token": "ExponentPushToken[smoke-device]", "platform": "ios"},
        )

        offices = await client.get("/api/v1/offices", params={"city": "Musterstadt"})
        offices.raise_for_status()
        office_ids = [o["id"] for o in offices.json()["items"]]
        print(f"offices found: {len(office_ids)}")

        categories = await client.get("/api/v1/offices/categories")
        print("categories:", [c["value"] for c in categories.json()])

        watch = await client.post(
            "/api/v1/watches",
            headers=headers,
            json={
                "label": "Perso Musterstadt",
                "category": "personalausweis",
                "office_ids": office_ids,
                "weekday_mask": 0b1111111,
                "min_lead_hours": 0,
            },
        )
        watch.raise_for_status()
        watch_id = watch.json()["id"]
        print(f"watch created: {watch_id}")

        sessionmaker = get_sessionmaker()
        async with sessionmaker() as session:
            scanned = await run_scan_cycle(session)
        print(f"scan cycle polled {scanned} office/service pairs")

        detail = await client.get(f"/api/v1/watches/{watch_id}", headers=headers)
        detail.raise_for_status()
        slots = detail.json()["matching_slots"]
        print(f"matching slots: {len(slots)}")
        for slot in slots[:5]:
            print(f"  {slot['starts_at']}  {slot['service_name']} @ {slot['office_name']}")

        alerts = await client.get("/api/v1/notifications", headers=headers)
        alerts.raise_for_status()
        print(f"notifications: {len(alerts.json())}")
        for alert in alerts.json()[:3]:
            print(f"  [{alert['status']}] {alert['title']} — {alert['body']}")

        if slots:
            booking = await client.post(
                "/api/v1/bookings",
                headers=headers,
                json={"slot_id": slots[0]["id"], "watch_id": watch_id},
            )
            booking.raise_for_status()
            print(f"handoff url: {booking.json()['handoff_url']}")

        health = await client.get("/api/v1/health/scanner")
        print("scanner health:", health.json())


if __name__ == "__main__":
    configure_logging()
    asyncio.run(main())
