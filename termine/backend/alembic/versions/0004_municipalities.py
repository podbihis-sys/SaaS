"""municipalities and postcodes

Revision ID: 0004_municipalities
Revises: 0003_office_scan_flag
Create Date: 2026-09-08 09:40:00.000000

"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

from app.db_types import GUID, UTCDateTime

revision: str = "0004_municipalities"
down_revision: str | Sequence[str] | None = "0003_office_scan_flag"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "municipalities",
        sa.Column("ags", sa.String(length=8), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("short_name", sa.String(length=80), nullable=False),
        sa.Column("kind", sa.String(length=2), nullable=False),
        sa.Column("population", sa.Integer(), nullable=False),
        sa.Column("area_ha", sa.Integer(), nullable=False),
        sa.Column("plz", sa.String(length=5), nullable=True),
        sa.Column("plz_multi", sa.Boolean(), nullable=False),
        sa.Column("district_ags", sa.String(length=5), nullable=False),
        sa.Column("district_name", sa.String(length=80), nullable=False),
        sa.Column("district_seat", sa.String(length=80), nullable=True),
        sa.Column("state_key", sa.String(length=2), nullable=False),
        sa.Column("state", sa.String(length=40), nullable=False),
        sa.Column("register_stand", sa.String(length=10), nullable=True),
        sa.Column("updated_at", UTCDateTime(), nullable=False),
        sa.PrimaryKeyConstraint("ags"),
    )
    op.create_index(op.f("ix_municipalities_short_name"), "municipalities", ["short_name"], unique=False)
    op.create_index(op.f("ix_municipalities_plz"), "municipalities", ["plz"], unique=False)
    op.create_index(op.f("ix_municipalities_district_ags"), "municipalities", ["district_ags"], unique=False)

    op.create_table(
        "postal_codes",
        sa.Column("id", GUID(), nullable=False),
        sa.Column("plz", sa.String(length=5), nullable=False),
        sa.Column("locality", sa.String(length=80), nullable=False),
        sa.Column("ags", sa.String(length=8), nullable=False),
        sa.Column("source", sa.String(length=16), nullable=False),
        sa.Column("created_at", UTCDateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plz", "ags", "locality", name="uq_postal_codes_plz_ags_locality"),
    )
    op.create_index(op.f("ix_postal_codes_plz"), "postal_codes", ["plz"], unique=False)
    op.create_index(op.f("ix_postal_codes_ags"), "postal_codes", ["ags"], unique=False)

    op.create_table(
        "postal_code_lookups",
        sa.Column("plz", sa.String(length=5), nullable=False),
        sa.Column("hits", sa.Integer(), nullable=False),
        sa.Column("checked_at", UTCDateTime(), nullable=False),
        sa.PrimaryKeyConstraint("plz"),
    )

    op.add_column("offices", sa.Column("municipality_ags", sa.String(length=8), nullable=True))
    op.create_index(op.f("ix_offices_municipality_ags"), "offices", ["municipality_ags"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_offices_municipality_ags"), table_name="offices")
    op.drop_column("offices", "municipality_ags")
    op.drop_table("postal_code_lookups")
    op.drop_index(op.f("ix_postal_codes_ags"), table_name="postal_codes")
    op.drop_index(op.f("ix_postal_codes_plz"), table_name="postal_codes")
    op.drop_table("postal_codes")
    op.drop_index(op.f("ix_municipalities_district_ags"), table_name="municipalities")
    op.drop_index(op.f("ix_municipalities_plz"), table_name="municipalities")
    op.drop_index(op.f("ix_municipalities_short_name"), table_name="municipalities")
    op.drop_table("municipalities")
