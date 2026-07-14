import Image from "next/image";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { DrawRule } from "./Reveal";
import {
  BASE_PRICES,
  LANGUAGE_SURCHARGE,
  MARKET_BY_LOCALE,
  REGION_FACTOR,
  round10,
  type ProjectType,
} from "@/lib/quote";
import {
  VAT_L10N,
  fmtAmount,
  grossOf,
  maintenancePrices,
  planPrices,
  vatPercent,
} from "@/lib/pricing-display";

function SectionTitle({ title, lead, id }: { title: string; lead?: string; id?: string }) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} className="section-title">
        {title}
      </h2>
      {lead && <p className="mt-5 max-w-[62ch] text-[1.02rem] leading-relaxed text-muted">{lead}</p>}
    </div>
  );
}

/** Static market strip — plain set text, no marquee. */
export function TrustMarquee({ dict }: { dict: Dictionary["trust"] }) {
  return (
    <section className="border-y border-rule" aria-label={dict.title}>
      <div className="container-site flex flex-col gap-3 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
        <p className="shrink-0 text-sm font-semibold text-ink">{dict.title}</p>
        <p className="text-sm leading-relaxed text-muted">
          {dict.items.join("  ·  ")}
        </p>
      </div>
    </section>
  );
}

/** Services as an index: full-width rows a studio would set, no cards. */
export function Services({ dict }: { dict: Dictionary["services"] }) {
  return (
    <section id="services" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-site">
        <SectionTitle title={dict.title} lead={dict.subtitle} />
        <div className="mt-14 border-t border-rule">
          {dict.items.map((item) => (
            <div
              key={item.title}
              className="group grid gap-2 border-b border-rule py-7 transition-colors duration-[250ms] hover:bg-tiefsee sm:grid-cols-12 sm:gap-8 sm:py-8"
            >
              <h3 className="px-1 text-[1.35rem] font-semibold leading-snug text-ink transition-colors duration-[250ms] group-hover:text-white sm:col-span-5 sm:text-[1.6rem]">
                {item.title}
              </h3>
              <p className="max-w-[58ch] px-1 text-[0.95rem] leading-relaxed text-muted transition-colors duration-[250ms] group-hover:text-white/80 sm:col-span-7">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Live client projects — the screenshot links straight to the real site. */
const REFERENCES: Array<{
  name: string;
  url: string;
  image: string;
  industry: Record<Locale, string>;
}> = [
  {
    name: "Restaurant Adria",
    url: "https://adria-koeln.de",
    image: "/references/adria-koeln.jpg",
    industry: {
      de: "Restaurant · Köln",
      en: "Restaurant · Cologne",
      hr: "Restoran · Köln",
      bs: "Restoran · Köln",
      sr: "Restoran · Keln",
    },
  },
  {
    name: "Hotel Klosterstuben",
    url: "https://hotel-klosterstuben.com",
    image: "/references/hotel-klosterstuben.jpg",
    industry: {
      de: "Hotel & Restaurant",
      en: "Hotel & restaurant",
      hr: "Hotel i restoran",
      bs: "Hotel i restoran",
      sr: "Hotel i restoran",
    },
  },
  {
    name: "BIT Bierther GmbH",
    url: "https://web-five-lime-bbyohdw5k8.vercel.app/bit",
    image: "/references/bit.jpg",
    industry: {
      de: "Industrietechnik",
      en: "Industrial technology",
      hr: "Industrijska tehnika",
      bs: "Industrijska tehnika",
      sr: "Industrijska tehnika",
    },
  },
  {
    name: "Natürlich Grün",
    url: "https://natuerlich-gruen.vercel.app/",
    image: "/references/natuerlich-gruen.jpg",
    industry: {
      de: "Garten- & Landschaftsbau",
      en: "Garden & landscaping",
      hr: "Uređenje vrtova i okoliša",
      bs: "Uređenje vrtova i okoliša",
      sr: "Uređenje vrtova i okoline",
    },
  },
];

const REF_L10N: Record<Locale, { title: string; lead: string }> = {
  de: {
    title: "Referenzen",
    lead: "Ein Auszug aus unseren Projekten – klicken Sie auf ein Bild und besuchen Sie die Website direkt.",
  },
  en: {
    title: "Selected work",
    lead: "A selection of our projects – click any picture to visit the live website.",
  },
  hr: {
    title: "Reference",
    lead: "Izbor naših projekata – kliknite na sliku i posjetite stranicu uživo.",
  },
  bs: {
    title: "Reference",
    lead: "Izbor naših projekata – kliknite na sliku i posjetite stranicu uživo.",
  },
  sr: {
    title: "Reference",
    lead: "Izbor naših projekata – kliknite na sliku i posetite sajt uživo.",
  },
};

export function References({ locale }: { locale: Locale }) {
  const t = REF_L10N[locale];
  return (
    <section id="references" className="scroll-mt-24 border-t border-rule py-24 sm:py-32">
      <div className="container-site">
        <SectionTitle title={t.title} lead={t.lead} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {REFERENCES.map((ref) => (
            <a
              key={ref.name}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border border-rule bg-paper transition-colors hover:border-ink"
            >
              <span className="relative block aspect-[16/10] overflow-hidden border-b border-rule">
                <Image
                  src={ref.image}
                  alt={`${ref.name} – ${ref.industry[locale]}`}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </span>
              <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4">
                <span className="font-semibold text-ink">{ref.name}</span>
                <span className="text-xs text-muted">{ref.industry[locale]}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A real sequence: one drawn rule, four stations along it. */
export function Process({ dict }: { dict: Dictionary["process"] }) {
  return (
    <section id="process" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container-site">
        <SectionTitle title={dict.title} />
        <div className="mt-14">
          <DrawRule className="h-[2px] w-full bg-ink" />
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {dict.steps.map((step, i) => (
              <div key={step.title}>
                <p className="tabular text-sm font-semibold text-tiefsee">{i + 1} / {dict.steps.length}</p>
                <h3 className="mt-2 text-[1.15rem] font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Price-driver rows: how the fixed price actually forms. */
function PriceDrivers({
  contact,
  pricing,
  locale,
}: {
  contact: Dictionary["contact"];
  pricing: Dictionary["pricing"];
  locale: Locale;
}) {
  const market = MARKET_BY_LOCALE[locale] ?? "de";
  const factor = REGION_FACTOR[market] ?? 1;
  // Guide values in EUR, shown gross: net = region-factored base, then VAT on top.
  const money = (v: number) => `${fmtAmount(grossOf(round10(v * factor), market))} €`;
  const l10n = VAT_L10N[locale] ?? VAT_L10N.de;
  const projectTypes = Object.entries(contact.projectTypes) as Array<[ProjectType, string]>;

  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <h3 className="text-[1.15rem] font-semibold text-ink">{pricing.subtitle}</h3>
      <table className="mt-5 w-full border-collapse text-[0.95rem]">
        <tbody>
          {projectTypes.map(([key, label]) => (
            <tr key={key} className="border-b border-rule">
              <td className="py-3 pr-4 text-muted">{label}</td>
              <td className="tabular py-3 text-right font-semibold text-ink">
                {pricing.from} {money(BASE_PRICES[key])}
              </td>
            </tr>
          ))}
          <tr className="border-b border-rule">
            <td className="py-3 pr-4 text-muted">{contact.pagesOptions.medium}</td>
            <td className="tabular py-3 text-right font-semibold text-ink">+ 35 %</td>
          </tr>
          <tr className="border-b border-rule">
            <td className="py-3 pr-4 text-muted">{contact.pagesOptions.large}</td>
            <td className="tabular py-3 text-right font-semibold text-ink">+ 90 %</td>
          </tr>
          <tr className="border-b border-rule">
            <td className="py-3 pr-4 text-muted">{contact.languagesOptions.two}</td>
            <td className="tabular py-3 text-right font-semibold text-ink">
              + {money(LANGUAGE_SURCHARGE.two)}
            </td>
          </tr>
          <tr>
            <td className="py-3 pr-4 text-muted">{contact.languagesOptions.many}</td>
            <td className="tabular py-3 text-right font-semibold text-ink">
              + {money(LANGUAGE_SURCHARGE.many)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">
        {l10n.allPrices} {l10n.incl} {vatPercent(market)} {l10n.vat}
      </p>
    </div>
  );
}

/** Pricing as an honest document: a genuine table, not three glow cards. */
export function Pricing({
  dict,
  contact,
  locale,
}: {
  dict: Dictionary["pricing"];
  contact: Dictionary["contact"];
  locale: Locale;
}) {
  const maxFeatures = Math.max(...dict.plans.map((p) => p.features.length));
  const prices = planPrices(locale);
  const l10n = VAT_L10N[locale] ?? VAT_L10N.de;

  return (
    <section id="pricing" className="scroll-mt-24 border-t border-rule py-24 sm:py-32">
      <div className="container-site">
        <SectionTitle title={dict.title} />
        <div>
          <p className="mt-8 text-sm font-semibold text-ink">
            {dict.popular}: {dict.plans[1].name}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  {dict.plans.map((plan, i) => (
                    <th
                      key={plan.name}
                      scope="col"
                      className="w-1/3 border border-rule bg-paper p-6 text-left align-top"
                    >
                      <p className="text-[1.15rem] font-semibold text-ink">{plan.name}</p>
                      <p className="tabular mt-3 text-[2rem] font-semibold leading-none text-ink lg:text-[2.4rem]">
                        <span className="mr-1.5 align-middle text-sm font-medium text-muted">{dict.from}</span>
                        {prices[i].gross}
                      </p>
                      <p className="mt-2 text-xs font-normal text-muted">
                        {l10n.incl} {prices[i].vatPct} {l10n.vat}
                        {prices[i].eurHint ? ` · ${prices[i].eurHint}` : ""} · {dict.once}
                      </p>
                      <p className="mt-3 text-sm font-normal leading-relaxed text-muted">{plan.desc}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxFeatures }, (_, row) => (
                  <tr key={row}>
                    {dict.plans.map((plan) => (
                      <td
                        key={plan.name}
                        className="border border-rule px-6 py-3 text-sm leading-relaxed text-muted"
                      >
                        {plan.features[row] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <a href="#contact" className="btn-primary">
              {dict.cta}
            </a>
          </div>
        </div>
        <PriceDrivers contact={contact} pricing={dict} locale={locale} />
        <p className="mx-auto mt-12 max-w-3xl text-sm leading-relaxed text-muted">{dict.note}</p>
      </div>
    </section>
  );
}

/** Maintenance as one tiefsee band: a segmented strip, not three cards. */
export function Maintenance({
  dict,
  locale,
}: {
  dict: Dictionary["maintenance"];
  locale: Locale;
}) {
  const tiers = maintenancePrices(locale);
  const l10n = VAT_L10N[locale] ?? VAT_L10N.de;
  return (
    <section id="maintenance" className="scroll-mt-24 bg-tiefsee py-24 sm:py-32">
      <div className="container-site">
        <div className="max-w-3xl">
          <h2 className="section-title !text-white">{dict.title}</h2>
          <p className="mt-5 max-w-[62ch] text-[1.02rem] leading-relaxed text-white/70">{dict.subtitle}</p>
        </div>
        <div>
          <div className="mt-14 grid border-y border-white/25 sm:grid-cols-3 sm:divide-x sm:divide-white/25">
            {dict.plans.map((plan, i) => (
              <div key={plan.name} className="border-b border-white/25 px-1 py-8 last:border-b-0 sm:border-b-0 sm:px-8 sm:first:pl-1 sm:last:pr-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[1.15rem] font-semibold text-white">{plan.name}</h3>
                  {i === 1 && (
                    <span className="text-xs font-medium uppercase tracking-[0.08em] text-white/70">
                      {dict.recommended}
                    </span>
                  )}
                </div>
                <p className="tabular mt-4 text-[2rem] font-semibold leading-none text-white">
                  {tiers[i].gross}
                  <span className="ml-1.5 text-sm font-normal text-white/70">{dict.perMonth}</span>
                </p>
                <p className="mt-1.5 text-xs text-white/60">
                  {l10n.incl} {tiers[i].vatPct} {l10n.vat}
                  {tiers[i].eurHint ? ` · ${tiers[i].eurHint}` : ""}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/80">{plan.desc}</p>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm leading-relaxed text-white/70">
                      — {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <a href="#contact" className="btn-inverse">
              {dict.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Two markets, one promise — set as two text columns, no flags, no map. */
export function Regions({ dict }: { dict: Dictionary["regions"] }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-site">
        <SectionTitle title={dict.title} lead={dict.subtitle} />
        <div className="mt-14 grid gap-10 border-t border-rule pt-10 md:grid-cols-2 md:gap-0 md:divide-x md:divide-rule">
          <div className="md:pr-12">
            <h3 className="text-[1.35rem] font-semibold text-ink">{dict.dach.title}</h3>
            <p className="mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted">{dict.dach.desc}</p>
          </div>
          <div className="md:pl-12">
            <h3 className="text-[1.35rem] font-semibold text-ink">{dict.adria.title}</h3>
            <p className="mt-3 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted">{dict.adria.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
