"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-21

"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

from app.db_types import GUID, JSONType

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


membership_role = sa.Enum("owner", "admin", "member", name="membership_role")
inquiry_status = sa.Enum(
    "new", "ai_pending", "ai_done", "quoted", "closed", "canceled", name="inquiry_status"
)
price_item_kind = sa.Enum("labor", "material", "area", "flat", name="price_item_kind")
quote_status = sa.Enum("draft", "sent", "accepted", "rejected", "expired", name="quote_status")


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False, unique=True),
        sa.Column("legal_name", sa.String(200), nullable=True),
        sa.Column("tax_id", sa.String(60), nullable=True),
        sa.Column("address_line1", sa.String(200), nullable=True),
        sa.Column("address_line2", sa.String(200), nullable=True),
        sa.Column("postal_code", sa.String(20), nullable=True),
        sa.Column("city", sa.String(120), nullable=True),
        sa.Column("country", sa.String(2), nullable=False, server_default="DE"),
        sa.Column("phone", sa.String(40), nullable=True),
        sa.Column("email", sa.String(200), nullable=True),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_companies_slug", "companies", ["slug"], unique=True)

    op.create_table(
        "users",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("email", sa.String(200), nullable=False, unique=True),
        sa.Column("full_name", sa.String(200), nullable=True),
        sa.Column("avatar_url", sa.String(500), nullable=True),
        sa.Column("phone", sa.String(40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "memberships",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id", GUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("role", membership_role, nullable=False, server_default="member"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("company_id", "user_id", name="uq_memberships_company_user"),
    )
    op.create_index("ix_memberships_company_id", "memberships", ["company_id"])
    op.create_index("ix_memberships_user_id", "memberships", ["user_id"])

    op.create_table(
        "company_settings",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("vat_rate", sa.Numeric(5, 4), nullable=False, server_default="0.1900"),
        sa.Column("currency", sa.String(3), nullable=False, server_default="EUR"),
        sa.Column("quote_number_prefix", sa.String(20), nullable=False, server_default="AN-"),
        sa.Column("quote_number_counter", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("bank_name", sa.String(200), nullable=True),
        sa.Column("iban", sa.String(40), nullable=True),
        sa.Column("bic", sa.String(20), nullable=True),
        sa.Column("locale", sa.String(10), nullable=False, server_default="de-DE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "customers",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(200), nullable=True),
        sa.Column("phone", sa.String(40), nullable=True),
        sa.Column("address_line1", sa.String(200), nullable=True),
        sa.Column("address_line2", sa.String(200), nullable=True),
        sa.Column("postal_code", sa.String(20), nullable=True),
        sa.Column("city", sa.String(120), nullable=True),
        sa.Column("country", sa.String(2), nullable=False, server_default="DE"),
        sa.Column("notes", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_customers_company_id", "customers", ["company_id"])
    op.create_index("ix_customers_company_created", "customers", ["company_id", "created_at"])

    op.create_table(
        "inquiries",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "customer_id",
            GUID(),
            sa.ForeignKey("customers.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", inquiry_status, nullable=False, server_default="new"),
        sa.Column("contact_email", sa.String(200), nullable=True),
        sa.Column("contact_phone", sa.String(40), nullable=True),
        sa.Column("address_line1", sa.String(200), nullable=True),
        sa.Column("postal_code", sa.String(20), nullable=True),
        sa.Column("city", sa.String(120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_inquiries_company_id", "inquiries", ["company_id"])
    op.create_index("ix_inquiries_customer_id", "inquiries", ["customer_id"])
    op.create_index("ix_inquiries_company_created", "inquiries", ["company_id", "created_at"])
    op.create_index("ix_inquiries_company_status", "inquiries", ["company_id", "status"])

    op.create_table(
        "inquiry_images",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "inquiry_id",
            GUID(),
            sa.ForeignKey("inquiries.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("storage_path", sa.String(600), nullable=False),
        sa.Column("public_url", sa.String(800), nullable=True),
        sa.Column("content_type", sa.String(80), nullable=False, server_default="image/jpeg"),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_inquiry_images_company_id", "inquiry_images", ["company_id"])
    op.create_index("ix_inquiry_images_inquiry_id", "inquiry_images", ["inquiry_id"])

    op.create_table(
        "ai_analyses",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "inquiry_id",
            GUID(),
            sa.ForeignKey("inquiries.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("model", sa.String(80), nullable=False),
        sa.Column("result", JSONType(), nullable=False),
        sa.Column("raw_response", JSONType(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_ai_analyses_company_id", "ai_analyses", ["company_id"])
    op.create_index("ix_ai_analyses_inquiry_id", "ai_analyses", ["inquiry_id"])

    op.create_table(
        "price_lists",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("currency", sa.String(3), nullable=False, server_default="EUR"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_price_lists_company_id", "price_lists", ["company_id"])

    op.create_table(
        "price_items",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "price_list_id",
            GUID(),
            sa.ForeignKey("price_lists.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("key", sa.String(120), nullable=False),
        sa.Column("label", sa.String(200), nullable=False),
        sa.Column("kind", price_item_kind, nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
        sa.Column("unit_price", sa.Numeric(12, 4), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="EUR"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("price_list_id", "key", name="uq_price_items_list_key"),
    )
    op.create_index("ix_price_items_company_id", "price_items", ["company_id"])
    op.create_index("ix_price_items_price_list_id", "price_items", ["price_list_id"])
    op.create_index("ix_price_items_company_key", "price_items", ["company_id", "key"])

    op.create_table(
        "quotes",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "inquiry_id",
            GUID(),
            sa.ForeignKey("inquiries.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "customer_id",
            GUID(),
            sa.ForeignKey("customers.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("number", sa.String(40), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("status", quote_status, nullable=False, server_default="draft"),
        sa.Column("currency", sa.String(3), nullable=False, server_default="EUR"),
        sa.Column("vat_rate", sa.Numeric(5, 4), nullable=False),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("vat_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("needs_pricing", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_quotes_company_id", "quotes", ["company_id"])
    op.create_index("ix_quotes_inquiry_id", "quotes", ["inquiry_id"])
    op.create_index("ix_quotes_customer_id", "quotes", ["customer_id"])
    op.create_index("ix_quotes_company_created", "quotes", ["company_id", "created_at"])
    op.create_index("ix_quotes_company_status", "quotes", ["company_id", "status"])

    op.create_table(
        "quote_positions",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column(
            "company_id",
            GUID(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "quote_id",
            GUID(),
            sa.ForeignKey("quotes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("item_key", sa.String(120), nullable=True),
        sa.Column("label", sa.String(300), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 3), nullable=False),
        sa.Column("unit_price", sa.Numeric(12, 4), nullable=True),
        sa.Column("line_total", sa.Numeric(12, 2), nullable=True),
        sa.Column("needs_pricing", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("notes", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_quote_positions_company_id", "quote_positions", ["company_id"])
    op.create_index("ix_quote_positions_quote_id", "quote_positions", ["quote_id"])


def downgrade() -> None:
    op.drop_table("quote_positions")
    op.drop_table("quotes")
    op.drop_table("price_items")
    op.drop_table("price_lists")
    op.drop_table("ai_analyses")
    op.drop_table("inquiry_images")
    op.drop_table("inquiries")
    op.drop_table("customers")
    op.drop_table("company_settings")
    op.drop_table("memberships")
    op.drop_table("users")
    op.drop_table("companies")
    quote_status.drop(op.get_bind(), checkfirst=True)
    price_item_kind.drop(op.get_bind(), checkfirst=True)
    inquiry_status.drop(op.get_bind(), checkfirst=True)
    membership_role.drop(op.get_bind(), checkfirst=True)
