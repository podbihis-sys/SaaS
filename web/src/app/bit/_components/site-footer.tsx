import Link from "next/link";
import { Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES, COMPANY } from "../_data/catalog";
import { EN_CATEGORY_LABELS } from "../_data/catalog-en";
import { materialTaxa, propertyTaxa, shrinkTaxa } from "../_data/attributes";
import { ShareButtons } from "./share-buttons";
import { ConsentSettingsLink } from "./cookie-banner";

/** Firmen-Links der Fußzeile, je Sprache. */
const COMPANY_LINKS = {
  de: [
    { href: "/bit/news", label: "News" },
    { href: "/bit/kompetenzen", label: "Kompetenzen" },
    { href: "/bit/branchen", label: "Branchen" },
    { href: "/bit/die-bit", label: "Die BIT" },
    { href: "/bit/karriere", label: "Karriere" },
    { href: "/bit/nachhaltigkeit", label: "Nachhaltigkeit" },
    { href: "/bit/qualitaet", label: "Qualität & Zertifikate" },
    { href: "/bit/service/downloads", label: "Downloads" },
    { href: "/bit/faq", label: "FAQ" },
    { href: "/bit/kontakt", label: "Kontakt" },
    { href: "/bit/impressum", label: "Impressum" },
    { href: "/bit/barrierefreiheit", label: "Barrierefreiheit" },
    { href: "/bit/datenschutz", label: "Datenschutz" },
  ],
  en: [
    { href: "/bit/en/about-bit", label: "About BIT" },
    { href: "/bit/en/industrial-sectors", label: "Industrial Sectors" },
    { href: "/bit/en/service", label: "Service" },
    { href: "/bit/en/service/downloads", label: "Downloads" },
    { href: "/bit/en/contact", label: "Contact" },
    { href: "/bit/en/imprint", label: "Imprint" },
    { href: "/bit/en/privacy-policy", label: "Privacy Policy" },
    { href: "/bit/en/legal-notice", label: "Legal notice" },
    { href: "/bit/en/general-terms-and-conditions", label: "General Terms and Conditions" },
  ],
} as const;

export function SiteFooter({ locale = "de" }: { locale?: "de" | "en" }) {
  const en = locale === "en";
  const popular = en
    ? []
    : [
        ...propertyTaxa().slice(0, 6).map((t) => ({
          href: `/bit/produkte/eigenschaft/${t.slug}`,
          label: t.label,
        })),
        ...materialTaxa().slice(0, 6).map((t) => ({
          href: `/bit/produkte/material/${t.slug}`,
          label: `${t.label}-Schläuche`,
        })),
        ...shrinkTaxa().map((t) => ({
          href: `/bit/produkte/schrumpfrate/${t.slug}`,
          label: `Schrumpfrate ${t.label}`,
        })),
      ];

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bit/logo.png"
              alt="BIT"
              className="h-[90px] w-auto max-w-full"
              width={656}
              height={128}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {en
              ? `Shrink and insulating tubing technology from a single source. Since ${COMPANY.foundedYear} your partner for heat-shrink, insulating and braided sleeves, corrugated conduits and cable ties.`
              : `${COMPANY.claim}. Seit ${COMPANY.foundedYear} Ihr Partner für Schrumpf-, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder.`}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/bit-bierther-gmbh1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={en ? "BIT on LinkedIn" : "BIT auf LinkedIn"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-5">
            <ShareButtons />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            {en ? "Products" : "Produkte"}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={en ? `/bit/en/products/${c.id}` : `/bit/${c.id}`}
                  className="text-slate-500 hover:text-[#1e4a7a]"
                >
                  {en ? EN_CATEGORY_LABELS[c.id] ?? c.name : `${c.name} kaufen`}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            {en ? "Company" : "Unternehmen"}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {COMPANY_LINKS[en ? "en" : "de"].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-slate-500 hover:text-[#1e4a7a]">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/bit/warenkorb" rel="nofollow" className="text-slate-500 hover:text-[#1e4a7a]">
                {en ? "Inquiry / Cart" : "Anfrage / Warenkorb"}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            {en ? "Contact" : "Kontakt"}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1e4a7a]" />
              <span>{COMPANY.street}<br />{COMPANY.zip} {COMPANY.city}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[#1e4a7a]" />
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-[#1e4a7a]">{COMPANY.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[#1e4a7a]" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-[#1e4a7a]">{COMPANY.email}</a>
            </li>
          </ul>
        </div>
      </div>

      {!en && (
        <div className="border-t border-slate-200">
          <div className="container py-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Beliebte Suchen</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {popular.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {COMPANY.legalName}.{" "}
            {en ? "All rights reserved." : "Alle Rechte vorbehalten."} ·{" "}
            <Link href={en ? "/bit/en/imprint" : "/bit/impressum"} className="hover:text-[#1e4a7a]">
              {en ? "Imprint" : "Impressum"}
            </Link>{" "}
            ·{" "}
            <Link href={en ? "/bit/en/privacy-policy" : "/bit/datenschutz"} className="hover:text-[#1e4a7a]">
              {en ? "Privacy Policy" : "Datenschutz"}
            </Link>{" "}
            ·{" "}
            {en ? (
              <Link href="/bit/en/legal-notice" className="hover:text-[#1e4a7a]">Legal notice</Link>
            ) : (
              <Link href="/bit/barrierefreiheit" className="hover:text-[#1e4a7a]">Barrierefreiheit</Link>
            )}{" "}
            · <ConsentSettingsLink className="hover:text-[#1e4a7a] hover:underline" />
          </span>
          <span>
            {COMPANY.register} · {en ? "Managing Director" : "Geschäftsführer"}: {COMPANY.managingDirector}
          </span>
        </div>
      </div>
    </footer>
  );
}
