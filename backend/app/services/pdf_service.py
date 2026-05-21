from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.errors import ExternalServiceError
from app.models.company import Company
from app.models.quote import Quote
from app.models.settings import CompanySettings

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"


def _format_eur(value: Decimal | None) -> str:
    if value is None:
        return "—"
    q = Decimal(value).quantize(Decimal("0.01"))
    s = f"{q:,.2f}"
    s = s.replace(",", "_").replace(".", ",").replace("_", ".")
    return f"{s} €"


def _format_qty(value: Decimal) -> str:
    q = Decimal(value).quantize(Decimal("0.001"))
    s = f"{q:,.3f}"
    s = s.replace(",", "_").replace(".", ",").replace("_", ".")
    return s.rstrip("0").rstrip(",") if "," in s else s


def _format_date_de(d: datetime) -> str:
    return d.strftime("%d.%m.%Y")


def _format_percent(value: Decimal) -> str:
    pct = (Decimal(value) * Decimal("100")).quantize(Decimal("0.01"))
    s = f"{pct:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
    return f"{s} %"


def _jinja_env() -> Environment:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
    )
    env.filters["eur"] = _format_eur
    env.filters["qty"] = _format_qty
    env.filters["date_de"] = _format_date_de
    env.filters["percent"] = _format_percent
    return env


class PDFService:
    def __init__(self) -> None:
        self.env = _jinja_env()

    def render_quote_html(
        self,
        *,
        quote: Quote,
        company: Company,
        settings_obj: CompanySettings | None,
        customer_block: dict[str, str | None] | None,
    ) -> str:
        tpl = self.env.get_template("quote.html")
        return tpl.render(
            quote=quote,
            company=company,
            settings=settings_obj,
            customer=customer_block or {},
            generated_at=datetime.utcnow(),
        )

    def render_quote_pdf(
        self,
        *,
        quote: Quote,
        company: Company,
        settings_obj: CompanySettings | None,
        customer_block: dict[str, str | None] | None,
    ) -> bytes:
        try:
            from weasyprint import HTML  # type: ignore[import-not-found]
        except Exception as e:
            raise ExternalServiceError(
                "WeasyPrint not available; install system libs (libpango, libcairo)"
            ) from e

        html = self.render_quote_html(
            quote=quote,
            company=company,
            settings_obj=settings_obj,
            customer_block=customer_block,
        )
        pdf_bytes = HTML(string=html, base_url=str(TEMPLATES_DIR)).write_pdf()
        if pdf_bytes is None:
            raise ExternalServiceError("PDF generation produced empty output")
        return pdf_bytes

    def build_filename(self, quote_id: uuid.UUID, number: str) -> str:
        safe = number.replace("/", "-").replace(" ", "_")
        return f"Angebot_{safe}_{str(quote_id)[:8]}.pdf"
