"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { ITEM_LABELS, ISSUE_LABELS, type Quote } from "@/lib/quote";
import type { SiteAnalysis } from "@/lib/scraper";
import { Reveal } from "./Reveal";

interface RegionInfo {
  claimed: string;
  effective: string;
  mismatch: boolean;
}

interface ApiResult {
  quote: Quote;
  analysis: SiteAnalysis | null;
  emailSent: boolean;
  region?: RegionInfo;
}

// Shown when the price was calculated for the company's registered seat
// (from the address) instead of the country the visitor picked in the form.
const REGION_NOTICE: Record<Locale, { title: string; body: string }> = {
  de: {
    title: "Hinweis zu Ihrem Land",
    body: "Sie hatten {claimed} ausgewählt. Anhand Ihres Firmensitzes ({effective}) haben wir den Preis für {effective} berechnet – so gelten für Sie automatisch die korrekten, marktüblichen Preise.",
  },
  en: {
    title: "A note on your country",
    body: "You selected {claimed}. Based on your registered company address ({effective}) we calculated the price for {effective}, so you automatically get the correct local market pricing.",
  },
  hr: {
    title: "Napomena o vašoj državi",
    body: "Odabrali ste {claimed}. Na temelju sjedišta vaše tvrtke ({effective}) izračunali smo cijenu za {effective} – tako automatski dobivate ispravne, tržišno uobičajene cijene.",
  },
  bs: {
    title: "Napomena o vašoj državi",
    body: "Odabrali ste {claimed}. Na osnovu sjedišta vaše firme ({effective}) izračunali smo cijenu za {effective} – tako automatski dobijate ispravne, tržišno uobičajene cijene.",
  },
  sr: {
    title: "Napomena o vašoj državi",
    body: "Izabrali ste {claimed}. Na osnovu sedišta vaše firme ({effective}) izračunali smo cenu za {effective} – tako automatski dobijate ispravne, tržišno uobičajene cene.",
  },
};

function euro(amount: number): string {
  return `${amount.toLocaleString("de-DE")} €`;
}

// Pre-select the market that matches the visitor's language so the quote is
// priced (and shown in the currency) for their region by default.
const LOCALE_DEFAULT_COUNTRY: Record<Locale, string> = {
  de: "de",
  en: "de",
  hr: "hr",
  bs: "ba",
  sr: "rs",
};

export function ContactForm({
  locale,
  dict,
  offerDict,
  maintenanceNames,
  maintenancePerMonth,
}: {
  locale: Locale;
  dict: Dictionary["contact"];
  offerDict: Dictionary["offer"];
  maintenanceNames: { basic: string; business: string; premium: string };
  maintenancePerMonth: string;
}) {
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [company, setCompany] = useState("");
  const defaultCountry = LOCALE_DEFAULT_COUNTRY[locale] ?? "de";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      company: form.get("company"),
      address: form.get("address"),
      country: form.get("country"),
      hasWebsite: hasWebsite === true,
      websiteUrl: form.get("websiteUrl"),
      projectType: form.get("projectType"),
      pages: form.get("pages"),
      languages: form.get("languages"),
      maintenance: form.get("maintenance"),
      message: form.get("message"),
      locale,
    };

    if (!payload.name || !payload.email || !payload.company || !payload.address || hasWebsite === null) {
      setError(dict.errorRequired);
      return;
    }
    if (hasWebsite && !payload.websiteUrl) {
      setError(dict.errorRequired);
      return;
    }

    setSubmitting(true);
    setCompany(String(payload.company));
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data: ApiResult = await res.json();
      setResult(data);
    } catch {
      setError(dict.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 border-t border-white/[0.06] py-24 sm:py-32">
      <div className="container-site max-w-4xl">
        <Reveal className="text-center">
          <p className="section-index justify-center">
            <span className="text-adriatic-400">/</span> {dict.kicker.toLowerCase()}
          </p>
          <h2 className="section-title mt-4">{dict.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-slate-400">{dict.subtitle}</p>
        </Reveal>

        <AnimatePresence mode="wait">
          {result ? (
            <OfferResult
              key="offer"
              result={result}
              company={company}
              locale={locale}
              dict={offerDict}
              countries={dict.countries}
              maintenanceNames={maintenanceNames}
              maintenancePerMonth={maintenancePerMonth}
              onReset={() => {
                setResult(null);
                setHasWebsite(null);
              }}
            />
          ) : (
            <motion.form
              key="form"
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="card-glass mt-12 p-6 sm:p-10"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label-field">{dict.name}</label>
                  <input id="name" name="name" required autoComplete="name" placeholder={dict.namePh} className="input-field" />
                </div>
                <div>
                  <label htmlFor="email" className="label-field">{dict.email}</label>
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder={dict.emailPh} className="input-field" />
                </div>
                <div>
                  <label htmlFor="phone" className="label-field">{dict.phone}</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={dict.phonePh} className="input-field" />
                </div>
                <div>
                  <label htmlFor="company" className="label-field">{dict.company}</label>
                  <input id="company" name="company" required autoComplete="organization" placeholder={dict.companyPh} className="input-field" />
                </div>
                <div>
                  <label htmlFor="address" className="label-field">{dict.address}</label>
                  <input id="address" name="address" required autoComplete="street-address" placeholder={dict.addressPh} className="input-field" />
                </div>
                <div>
                  <label htmlFor="country" className="label-field">{dict.country}</label>
                  <select id="country" name="country" className="input-field" defaultValue={defaultCountry}>
                    {Object.entries(dict.countries).map(([code, label]) => (
                      <option key={code} value={code} className="bg-navy-900">{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="mt-7">
                <legend className="label-field">{dict.hasWebsite}</legend>
                <div className="flex gap-3">
                  {[
                    { value: true, label: dict.yes },
                    { value: false, label: dict.no },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setHasWebsite(option.value)}
                      className={`rounded-full px-8 py-2.5 text-sm font-semibold transition-all ${
                        hasWebsite === option.value
                          ? "bg-gradient-to-r from-adriatic-500 to-adriatic-400 text-navy-950 shadow-lg shadow-adriatic-500/25"
                          : "border border-white/15 bg-white/5 text-slate-300 hover:border-adriatic-400/50"
                      }`}
                      aria-pressed={hasWebsite === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <AnimatePresence>
                {hasWebsite === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 rounded-xl border border-adriatic-400/30 bg-adriatic-500/5 p-5">
                      <label htmlFor="websiteUrl" className="label-field">{dict.websiteUrl}</label>
                      <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="url"
                        inputMode="url"
                        placeholder={dict.websiteUrlPh}
                        className="input-field"
                      />
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-adriatic-300">
                        <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden>
                          <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
                          <path d="M8 7.5V11M8 5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        {dict.websiteUrlHint}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="projectType" className="label-field">{dict.projectType}</label>
                  <select id="projectType" name="projectType" className="input-field" defaultValue="new">
                    {Object.entries(dict.projectTypes).map(([code, label]) => (
                      <option key={code} value={code} className="bg-navy-900">{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pages" className="label-field">{dict.pages}</label>
                  <select id="pages" name="pages" className="input-field" defaultValue="small">
                    {Object.entries(dict.pagesOptions).map(([code, label]) => (
                      <option key={code} value={code} className="bg-navy-900">{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="languages" className="label-field">{dict.languagesLabel}</label>
                  <select id="languages" name="languages" className="input-field" defaultValue="one">
                    {Object.entries(dict.languagesOptions).map(([code, label]) => (
                      <option key={code} value={code} className="bg-navy-900">{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="maintenancePlan" className="label-field">{dict.maintenanceQ}</label>
                  <select id="maintenancePlan" name="maintenance" className="input-field" defaultValue="unsure">
                    {Object.entries(dict.maintenanceOptions).map(([code, label]) => (
                      <option key={code} value={code} className="bg-navy-900">{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="label-field">{dict.message}</label>
                <textarea id="message" name="message" rows={4} placeholder={dict.messagePh} className="input-field resize-y" />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 rounded-xl border border-coral-500/40 bg-coral-500/10 px-4 py-3 text-sm text-coral-400"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}

              <div className="mt-8 flex flex-col items-center gap-4">
                <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto sm:min-w-72">
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                        <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      {hasWebsite ? dict.analyzing : dict.submitting}
                    </>
                  ) : (
                    <>
                      {dict.submit}
                      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="max-w-md text-center text-xs text-slate-500">{dict.privacy}</p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function OfferResult({
  result,
  company,
  locale,
  dict,
  countries,
  maintenanceNames,
  maintenancePerMonth,
  onReset,
}: {
  result: ApiResult;
  company: string;
  locale: Locale;
  dict: Dictionary["offer"];
  countries: Record<string, string>;
  maintenanceNames: { basic: string; business: string; premium: string };
  maintenancePerMonth: string;
  onReset: () => void;
}) {
  const { quote, analysis, emailSent, region } = result;
  const notice = region?.mismatch ? REGION_NOTICE[locale] : null;
  const countryName = (code: string) => countries[code] ?? code;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12"
    >
      <div className="overflow-hidden rounded-2xl border border-adriatic-400/30 bg-white/[0.04]">
        <div className="bg-gradient-to-r from-adriatic-500/20 via-adriatic-500/10 to-transparent px-6 py-8 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-adriatic-300">{dict.subtitle}</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{dict.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {dict.forCompany} <span className="font-semibold text-white">{company}</span>
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          {notice && region && (
            <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-yellow-200">
                <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                  <path d="M8 1.5 15 14H1L8 1.5Z" stroke="currentColor" strokeLinejoin="round" />
                  <path d="M8 6.5v3.2M8 11.5v.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {notice.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-yellow-100/80">
                {notice.body
                  .replaceAll("{claimed}", countryName(region.claimed))
                  .replaceAll("{effective}", countryName(region.effective))}
              </p>
            </div>
          )}
          {analysis?.reachable && (
            <div className="mb-8 rounded-xl border border-white/10 bg-navy-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="font-semibold text-white">{dict.analysisTitle}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{dict.scoreLabel}</span>
                  <span
                    className={`rounded-full px-3 py-1 font-display text-sm font-bold ${
                      analysis.score >= 70
                        ? "bg-adriatic-500/20 text-adriatic-300"
                        : analysis.score >= 40
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-coral-500/20 text-coral-400"
                    }`}
                  >
                    {analysis.score} / 100
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    analysis.score >= 70 ? "bg-adriatic-400" : analysis.score >= 40 ? "bg-yellow-400" : "bg-coral-500"
                  }`}
                />
              </div>
              {analysis.issues.length > 0 && (
                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {analysis.issues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2 text-xs text-slate-400">
                      <svg viewBox="0 0 12 12" className="mt-0.5 h-3 w-3 shrink-0 text-coral-400" fill="none" aria-hidden>
                        <path d="M6 1 11 10H1L6 1Z" stroke="currentColor" strokeLinejoin="round" />
                      </svg>
                      {ISSUE_LABELS[issue]?.[locale] ?? issue}
                    </li>
                  ))}
                </ul>
              )}
              {analysis.techStack.length > 0 && (
                <p className="mt-3 text-xs text-slate-500">Tech: {analysis.techStack.join(" · ")}</p>
              )}
            </div>
          )}

          <h4 className="mb-4 font-semibold text-white">{dict.positionsTitle}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-medium">{dict.item}</th>
                  <th className="pb-3 text-right font-medium">{dict.price}</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <motion.tr
                    key={item.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-3.5 pr-4 text-slate-300">
                      {ITEM_LABELS[item.key]?.[locale] ?? ITEM_LABELS[item.key]?.de ?? item.key}
                    </td>
                    <td className="py-3.5 text-right font-medium text-white">{euro(item.amount)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-adriatic-500/20 to-adriatic-500/5 p-5 sm:col-span-1">
              <p className="text-xs text-slate-400">{dict.totalLabel}</p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                {quote.localCurrency
                  ? `${quote.localCurrency.totalMax.toLocaleString("de-DE")} ${quote.localCurrency.code}`
                  : euro(quote.totalMax)}
              </p>
              {quote.localCurrency && (
                <p className="text-xs text-adriatic-300">≈ {euro(quote.totalMax)}</p>
              )}
              <p className="mt-1 text-[11px] text-slate-500">{dict.vatNote}</p>
            </div>
            <div className="rounded-xl border border-white/10 p-5">
              <p className="text-xs text-slate-400">{dict.timelineLabel}</p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                {quote.timelineWeeksMin}–{quote.timelineWeeksMax} {dict.weeks}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 p-5">
              <p className="text-xs text-slate-400">{dict.maintenanceLabel}</p>
              <p className="mt-1 font-display text-xl font-bold text-white">
                {maintenanceNames[quote.recommendedMaintenance]}
              </p>
              <p className="text-xs text-adriatic-300">
                {quote.localCurrency
                  ? `${quote.localCurrency.maintenanceMonthly.toLocaleString("de-DE")} ${quote.localCurrency.code} (≈ ${euro(quote.maintenancePriceMonthly)})`
                  : euro(quote.maintenancePriceMonthly)}{" "}
                {maintenancePerMonth}
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-slate-500">{dict.validity}</p>
          {emailSent && <p className="mt-2 text-xs text-adriatic-300">✓ {dict.emailSent}</p>}

          <button onClick={onReset} className="btn-secondary mt-8">
            {dict.newRequest}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
