import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { buildQuote, ITEM_LABELS, MARKET_BY_LOCALE, type LeadInput } from "@/lib/quote";
import { VAT_L10N, fmtAmount } from "@/lib/pricing-display";
import { Logo } from "./Logo";

/** The few words the specimen document needs beyond the shared dictionaries. */
const DOC_L10N: Record<
  Locale,
  { doc: string; sample: string; total: string }
> = {
  de: { doc: "Kostenvoranschlag", sample: "Muster", total: "Festpreis" },
  en: { doc: "Cost estimate", sample: "Sample", total: "Fixed price" },
  hr: { doc: "Ponuda", sample: "Primjer", total: "Fiksna cijena" },
  bs: { doc: "Ponuda", sample: "Primjer", total: "Fiksna cijena" },
  sr: { doc: "Ponuda", sample: "Primer", total: "Fiksna cena" },
};

function money(amount: number, currency?: string): string {
  return `${fmtAmount(amount)} ${currency ?? "€"}`;
}

/** Sets the CSS animation delay for the load choreography. */
function delay(seconds: number): CSSProperties {
  return { "--d": `${seconds}s` } as CSSProperties;
}

/**
 * Decorative sea chart behind the headline: bathymetric depth lines in pale
 * tiefsee that drift like current and shelve closer together toward the
 * deep-sea band below — the Adria as a nautical chart, not a particle field.
 */
function SeaChart() {
  // One smooth repeating wave (period 480), drawn one period wider than the
  // viewBox so the CSS drift of exactly 480 units loops without a seam.
  const wave = (y: number, amp: number) => {
    let d = `M -480 ${y} Q -360 ${y - amp} -240 ${y}`;
    for (let x = 0; x <= 2880; x += 240) d += ` T ${x} ${y}`;
    return d;
  };
  // Shelving profile: wider gaps and fainter ink near the surface (top),
  // tighter and darker toward the deep water. Alternating drift directions.
  const lines = [
    { y: 90, amp: 12, opacity: 0.07, dur: 96 },
    { y: 210, amp: 14, opacity: 0.09, dur: 84 },
    { y: 320, amp: 15, opacity: 0.11, dur: 74 },
    { y: 415, amp: 13, opacity: 0.14, dur: 64 },
    { y: 495, amp: 12, opacity: 0.17, dur: 56 },
    { y: 560, amp: 10, opacity: 0.2, dur: 48 },
    { y: 610, amp: 8, opacity: 0.24, dur: 42 },
    { y: 645, amp: 6, opacity: 0.28, dur: 36 },
  ];
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 660"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {lines.map((line, i) => (
        <path
          key={line.y}
          className="sea-line"
          data-dir={i % 2 === 1 ? "back" : undefined}
          style={{ "--dur": `${line.dur}s` } as CSSProperties}
          d={wave(line.y, line.amp)}
          fill="none"
          stroke="#0E4B5A"
          strokeOpacity={line.opacity}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
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
  // Gross fixed price up front, exact net + VAT of this market broken out.
  const v = VAT_L10N[locale] ?? VAT_L10N.de;
  const pct = `${(quote.vat.rate * 100).toLocaleString("de-DE")} %`;
  const total = quote.localCurrency
    ? money(quote.localCurrency.totalGross, quote.localCurrency.code)
    : money(quote.vat.gross);
  const totalSub = [
    quote.localCurrency ? `≈ ${money(quote.vat.gross)}` : null,
    quote.localCurrency
      ? `${v.net} ${money(quote.localCurrency.totalMax, quote.localCurrency.code)}`
      : `${v.net} ${money(quote.vat.net)}`,
    quote.localCurrency
      ? `${v.vat} (${pct}) ${money(quote.localCurrency.vatAmount, quote.localCurrency.code)}`
      : `${v.vat} (${pct}) ${money(quote.vat.amount)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section>
      {/* Kalk top: the claim over a drifting sea chart of the Adria. */}
      <div className="relative overflow-hidden pt-32 sm:pt-40">
        <SeaChart />
        <div className="container-site relative pb-16 sm:pb-20">
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
                  <p className="text-[0.8rem] font-medium uppercase tracking-[0.08em] text-tiefsee">
                    {l.total} · {v.incl} {pct} {v.vat}
                  </p>
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
