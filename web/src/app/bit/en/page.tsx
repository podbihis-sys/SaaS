import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES, CATEGORY_IMAGE, COMPANY } from "../_data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en" },
  title: "BIT – Heat-shrink & insulation tubing",
  description:
    "BIT Bierther GmbH: heat-shrink tubing, insulation sleeving, braided sleeving, corrugated conduits and cable ties. 1,000+ standard articles, delivery within 24 h.",
};

/** Englische Kategorienamen für die EN-Übersichtsseite. */
const EN_CATEGORY: Record<string, string> = {
  schrumpfschlauch: "Heat-shrink tubing",
  isolierschlauch: "Insulation sleeving",
  glasseidenschlauch: "Fibreglass sleeving",
  geflechtschlauch: "Braided sleeving",
  wellrohr: "Corrugated conduits",
  kabelbinder: "Cable ties",
  verarbeitungsgeraete: "Processing tools",
  "weitere-schrumpfprodukte": "Further heat-shrink products",
  "weitere-produkte": "Further products",
};

/**
 * Englische Einstiegsseite (Topbar-Sprachwahl DE/EN). Der Produktkatalog
 * selbst ist derzeit auf Deutsch – die Kategorien verlinken dorthin.
 */
export default function EnglishHome() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
            {COMPANY.legalName} – business customers only
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Heat-shrink tubing, insulation sleeving &amp; cable protection from a single source
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Since {COMPANY.foundedYear} we have been supplying automotive, electronics, machine
            building and medical technology with more than 1,000 standard articles – plus customised
            cutting and printing. Standard articles are usually delivered within 24 hours.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-slate-500">
            Detailed product pages are currently available in German. Our team will be happy to
            assist you in English – just give us a call or send an e-mail.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bit/produkte" className="bit-btn bit-btn-dark">
              <span>Browse products</span>
              <ArrowRight className="bit-arrow h-4 w-4" />
            </Link>
            <a href={`mailto:${COMPANY.email}`} className="bit-btn bit-btn-outline">
              <span>Request a quote</span>
            </a>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Our product range
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/bit/${cat.id}`}
              className="bit-card group flex h-full flex-col overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-t-[1.3rem] bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CATEGORY_IMAGE[cat.id]}
                  alt={EN_CATEGORY[cat.id] ?? cat.name}
                  className="bit-card-img h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 items-center justify-between gap-2 p-5">
                <p className="font-semibold text-slate-900">{EN_CATEGORY[cat.id] ?? cat.name}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#1e4a7a] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Contact</h2>
          <ul className="mt-6 grid gap-4 text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1e4a7a]" />
              <span>
                {COMPANY.legalName}
                <br />
                {COMPANY.street}, {COMPANY.zip} {COMPANY.city}, Germany
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-[#1e4a7a]" />
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-[#1e4a7a]">
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-[#1e4a7a]" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-[#1e4a7a]">
                {COMPANY.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-[#1e4a7a]" />
              <span>Mon–Fri 8:00 a.m.–5:00 p.m.</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
