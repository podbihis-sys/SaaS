import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { buildQuote, ITEM_LABELS, MARKET_BY_LOCALE, type LeadInput } from "@/lib/quote";
import { VAT_L10N, fmtAmount } from "@/lib/pricing-display";
import { Logo } from "./Logo";
import { HeroWaves } from "./HeroWaves";
import { CountUpPrice } from "./CountUpPrice";

/** The few words the specimen document needs beyond the shared dictionaries. */
const DOC_L10N: Record<
  Locale,
  { doc: string; sample: string; total: string; url: string }
> = {
  de: { doc: "Kostenvoranschlag", sample: "Muster", total: "Festpreis", url: "adriawebcode.com/angebot" },
  en: { doc: "Cost estimate", sample: "Sample", total: "Fixed price", url: "adriawebcode.com/quote" },
  hr: { doc: "Ponuda", sample: "Primjer", total: "Fiksna cijena", url: "adriawebcode.com/ponuda" },
  bs: { doc: "Ponuda", sample: "Primjer", total: "Fiksna cijena", url: "adriawebcode.com/ponuda" },
  sr: { doc: "Ponuda", sample: "Primer", total: "Fiksna cena", url: "adriawebcode.com/ponuda" },
};

/** Floating feature cards beside the specimen — real product facts. */
const CARD_L10N: Record<
  Locale,
  { aTitle: string; aSub: string; bTitle: string; bSub: string }
> = {
  de: {
    aTitle: "Festpreis-Garantie",
    aSub: "Keine versteckten Kosten – der Preis gilt.",
    bTitle: "Angebot angenommen",
    bSub: "Auftragsbestätigung kommt automatisch.",
  },
  en: {
    aTitle: "Fixed-price guarantee",
    aSub: "No hidden costs – the price stands.",
    bTitle: "Offer accepted",
    bSub: "Order confirmation sent automatically.",
  },
  hr: {
    aTitle: "Garancija fiksne cijene",
    aSub: "Bez skrivenih troškova – cijena vrijedi.",
    bTitle: "Ponuda prihvaćena",
    bSub: "Potvrda narudžbe stiže automatski.",
  },
  bs: {
    aTitle: "Garancija fiksne cijene",
    aSub: "Bez skrivenih troškova – cijena vrijedi.",
    bTitle: "Ponuda prihvaćena",
    bSub: "Potvrda narudžbe stiže automatski.",
  },
  sr: {
    aTitle: "Garancija fiksne cene",
    aSub: "Bez skrivenih troškova – cena važi.",
    bTitle: "Ponuda prihvaćena",
    bSub: "Potvrda porudžbine stiže automatski.",
  },
};

/** Reassurance line under the primary CTA. */
const TRUST_L10N: Record<Locale, string[]> = {
  de: ["Unverbindlich & kostenlos", "Festpreise inkl. MwSt.", "Persönliche Antwort in 24 Std."],
  en: ["Non-binding & free", "Fixed prices incl. VAT", "Personal reply within 24 h"],
  hr: ["Neobavezno i besplatno", "Fiksne cijene s PDV-om", "Osobni odgovor u 24 h"],
  bs: ["Neobavezno i besplatno", "Fiksne cijene s PDV-om", "Lični odgovor u 24 h"],
  sr: ["Neobavezno i besplatno", "Fiksne cene sa PDV-om", "Lični odgovor u 24 h"],
};

function money(amount: number, currency?: string): string {
  return `${fmtAmount(amount)} ${currency ?? "€"}`;
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
  const c = CARD_L10N[locale];

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
  const grossValue = quote.localCurrency ? quote.localCurrency.totalGross : quote.vat.gross;
  const grossCurrency = quote.localCurrency?.code ?? "€";
  const totalSub = [
    quote.localCurrency ? `≈ ${money(quote.vat.gross)}` : null,
    quote.localCurrency
      ? `${v.net} ${money(quote.localCurrency.totalNet, quote.localCurrency.code)}`
      : `${v.net} ${money(quote.vat.net)}`,
    quote.localCurrency
      ? `${v.vat} (${pct}) ${money(quote.localCurrency.vatAmount, quote.localCurrency.code)}`
      : `${v.vat} (${pct}) ${money(quote.vat.amount)}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const totalDelay = 0.62 + rows.length * 0.12;

  return (
    <section>
      {/* Kalk top: the claim over a living water surface. */}
      <div className="relative overflow-hidden pt-32 sm:pt-40">
        <HeroWaves />
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
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
              {TRUST_L10N[locale].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 shrink-0 text-white" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="relative mx-auto max-w-xl">
              {/* Floating feature cards — real product facts, xl+ only. They sit
                  in the whitespace around the frame, never over its content. */}
              <div className="float-card absolute -left-56 top-14 z-10 hidden w-48 xl:block" aria-hidden>
                <div className="print-row border border-rule bg-paper p-4" style={delay(1.35)}>
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-tiefsee">
                    {c.aTitle}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted">{c.aSub}</p>
                </div>
              </div>
              <div className="float-card absolute -bottom-12 -right-6 z-10 hidden w-64 xl:block" data-delay="2" aria-hidden>
                <div className="print-row flex items-start gap-3 border border-rule bg-paper p-3" style={delay(1.65)}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center bg-tiefsee text-white">
                    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold leading-tight text-ink">{c.bTitle}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{c.bSub}</span>
                  </span>
                </div>
              </div>

              {/* Browser chrome: the offer staged as the product it is. */}
              <div className="border border-rule bg-paper text-ink" aria-label={`${l.doc} (${l.sample})`}>
                <div className="flex items-center gap-1.5 border-b border-rule bg-kalk px-4 py-2.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-rule" />
                  <span className="h-2.5 w-2.5 rounded-full bg-rule" />
                  <span className="h-2.5 w-2.5 rounded-full bg-tiefsee/40" />
                  <span className="ml-3 max-w-[16rem] flex-1 truncate border border-rule bg-paper px-3 py-1 text-[11px] leading-none text-muted">
                    {l.url}
                  </span>
                </div>
                <div className="p-7 sm:p-9">
              <div className="print-row flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-rule pb-4" style={delay(0.5)}>
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
                style={delay(totalDelay)}
              >
                <div>
                  <p className="text-[0.8rem] font-medium uppercase tracking-[0.08em] text-tiefsee">
                    {l.total} · {v.incl} {pct} {v.vat}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{totalSub}</p>
                </div>
                <p className="tabular text-[2rem] font-semibold leading-none sm:text-[2.4rem]">
                  <CountUpPrice
                    value={grossValue}
                    currency={grossCurrency}
                    decimals={grossCurrency === "RSD" ? 0 : 2}
                    delay={totalDelay + 0.15}
                  />
                </p>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
