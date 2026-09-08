"""Load the office catalogue into the database.

Idempotent: existing offices are updated in place, keyed on
(provider, external_id), so re-running after a catalogue edit is safe.

    python -m scripts.seed
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select

from app.catalog import CATALOG, DEMO_SERVICES
from app.database import get_sessionmaker
from app.logging_config import configure_logging, get_logger
from app.models.office import Office, Service
from app.services.places import link_offices, seed_municipalities

log = get_logger(__name__)


async def seed() -> None:
    sessionmaker = get_sessionmaker()
    created = updated = 0

    async with sessionmaker() as session:
        for entry in CATALOG:
            data = dict(entry)
            data.pop("verified", None)
            external_id = data["external_id"]
            provider = data["provider"]

            office = (
                await session.execute(
                    select(Office).where(
                        Office.provider == provider, Office.external_id == external_id
                    )
                )
            ).scalar_one_or_none()

            if office is None:
                office = Office(**data)
                session.add(office)
                created += 1
            else:
                for field, value in data.items():
                    setattr(office, field, value)
                updated += 1
            await session.flush()

            for service_id, name, category, duration in DEMO_SERVICES.get(external_id, []):
                service = (
                    await session.execute(
                        select(Service).where(
                            Service.office_id == office.id, Service.external_id == service_id
                        )
                    )
                ).scalar_one_or_none()
                if service is None:
                    session.add(
                        Service(
                            office_id=office.id,
                            external_id=service_id,
                            name=name,
                            category=category,
                            duration_minutes=duration,
                        )
                    )
                else:
                    service.name = name
                    service.category = category
                    service.duration_minutes = duration

        # The official register goes in after the offices so every office can
        # be tied to its Gemeinde; unmatched cities are named, not hidden.
        m_created, m_updated = await seed_municipalities(session)
        unmatched = await link_offices(session, relink=True)
        await session.commit()

    log.info(
        "seed.done",
        created=created,
        updated=updated,
        municipalities_created=m_created,
        municipalities_updated=m_updated,
        offices_unmatched=[f"{o.city} ({o.name})" for o in unmatched],
    )


if __name__ == "__main__":
    configure_logging()
    asyncio.run(seed())
