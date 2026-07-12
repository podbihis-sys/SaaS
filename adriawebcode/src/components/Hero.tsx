import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { buildQuote, ITEM_LABELS, MARKET_BY_LOCALE, type LeadInput } from "@/lib/quote";
import { Logo } from "./Logo";

/** The few words the specimen document needs beyond the shared dictionaries. */
const DOC_L10N: Record<
  Locale,
  { doc: string; sample: string; total: string; vat: string }
> = {
  de: { doc: "Kostenvoranschlag", sample: "Muster", total: "Festpreis", vat: "zzgl. USt." },
  en: { doc: "Cost estimate", sample: "Sample", total: "Fixed price", vat: "plus VAT" },
  hr: { doc: "Ponuda", sample: "Primjer", total: "Fiksna cijena", vat: "bez PDV-a" },
  bs: { doc: "Ponuda", sample: "Primjer", total: "Fiksna cijena", vat: "bez PDV-a" },
  sr: { doc: "Ponuda", sample: "Primer", total: "Fiksna cena", vat: "bez PDV-a" },
};

function money(amount: number, currency?: string): string {
  return `${amount.toLocaleString("de-DE")} ${currency ?? "€"}`;
}

/** Sets the CSS animation delay for the load choreography. */
function delay(seconds: number): CSSProperties {
  return { "--d": `${seconds}s` } as CSSProperties;
}

/**
 * Server component: the whole hero — headline wipe and document print run as
 * pure CSS animations, so the content exists and becomes visible without JS.
 */
export function Hero({ dict, locale }: { dict: Dictionary["hero"]; locale: Locale }) {
  const l = DOC_L10N[locale];

  // The specimen shows what the engine actually produces for this market:
  // a representative new-website project, priced by the real quote logic.
  const specimenInput: LeadInput = {
    name: "",
    email: "",
    company: "",
    address: "",
    country: MARKET_BY_LOCALE[locale] ?? "de",
    hasWebsite: false,
    projectType: "new",
    pages: "small",
    languages: "two",
    maintenance: "unsure",
    locale,
  };
  const quote = buildQuote(specimenInput, null);
  const rows = quote.items.map((item) => ({
    label: ITEM_LABELS[item.key]?.[locale] ?? ITEM_LABELS[item.key]?.de ?? item.key,
    amount: money(item.amount),
  }));
  const total = quote.localCurrency
    ? money(quote.localCurrency.totalMax, quote.localCurrency.code)
    : money(quote.totalMax);
  const totalSub = quote.localCurrency ? `≈ ${money(quote.totalMax)} · ${l.vat}` : l.vat;

  return (
    <section className="pt-32 sm:pt-40">
      {/* Kalk top: the claim, set plainly in ink. */}
      <div className="container-site pb-16 sm:pb-20">
        <h1
          className="max-w-[13ch] font-semibold text-ink [font-size:clamp(2.75rem,6.5vw,5.25rem)] [letter-spacing:-0.02em] [line-height:1.06]"
          style={{ hyphens: "auto", overflowWrap: "break-word" }}
        >
          <span className="wipe-line block" style={delay(0.05)}>{dict.title1}</span>
          <span className="wipe-line block" style={delay(0.13)}>{dict.titleHighlight}</span>
          <span className="wipe-line block" style={delay(0.21)}>{dict.title2}</span>
        </h1>
        <p
          className="print-row mt-7 max-w-[62ch] text-[1.05rem] leading-[1.65] text-muted"
          style={delay(0.35)}
        >
          {dict.subtitle}
        </p>
      </div>

      {/* Tiefsee stage: the product itself — a specimen cost estimate. */}
      <div className="bg-tiefsee">
        <div className="container-site grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="text-[1.35rem] font-semibold leading-snug text-white sm:text-[1.6rem]">
              {dict.stat1Label} {dict.stat1Value}
            </p>
            <p className="mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed text-white/70">
              {dict.badge}
            </p>
            <a href="#contact" className="btn-inverse mt-8">
              {dict.cta1}
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="mx-auto max-w-xl bg-paper p-7 text-ink sm:p-9" aria-label={`${l.doc} (${l.sample})`}>
              <div className="print-row flex items-baseline justify-between gap-4 border-b border-rule pb-4" style={delay(0.5)}>
                <Logo size="doc" />
                <p className="text-xs uppercase tracking-[0.08em] text-muted">
                  {l.doc} · {l.sample}
                </p>
              </div>

              <div className="flex flex-col">
                {rows.map((row, i) => (
                  <div
                    key={row.label}
                    className="print-row flex items-baseline justify-between gap-6 border-b border-rule py-3.5"
                    style={delay(0.62 + i * 0.12)}
                  >
                    <p className="text-[0.9rem] leading-snug text-muted">{row.label}</p>
                    <p className="tabular whitespace-nowrap text-[0.95rem] font-semibold">{row.amount}</p>
                  </div>
                ))}
              </div>

              <div
                className="print-row mt-5 flex items-end justify-between gap-6"
                style={delay(0.62 + rows.length * 0.12)}
              >
                <div>
                  <p className="text-[0.8rem] font-medium uppercase tracking-[0.08em] text-tiefsee">{l.total}</p>
                  <p className="mt-0.5 text-xs text-muted">{totalSub}</p>
                </div>
                <p className="tabular text-[2rem] font-semibold leading-none sm:text-[2.4rem]">{total}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
