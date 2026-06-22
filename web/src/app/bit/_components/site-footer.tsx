import Link from "next/link";
import { Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES, COMPANY } from "../_data/catalog";
import { materialTaxa, propertyTaxa, shrinkTaxa } from "../_data/attributes";
import { ShareButtons } from "./share-buttons";

export function SiteFooter() {
  const popular = [
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
              alt="BIT Bierther GmbH"
              className="h-14 w-auto"
              width={287}
              height={56}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            {COMPANY.claim}. Seit {COMPANY.foundedYear} Ihr Partner für Schrumpf-,
            Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/bit-bierther-gmbh1"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BIT Bierther GmbH auf LinkedIn"
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
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Produkte</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/bit/produkte/kategorie/${c.id}`} className="text-slate-500 hover:text-[#1e4a7a]">
                  {c.name} kaufen
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Unternehmen</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/bit/news" className="text-slate-500 hover:text-[#1e4a7a]">News</Link></li>
            <li><Link href="/bit/kompetenzen" className="text-slate-500 hover:text-[#1e4a7a]">Kompetenzen</Link></li>
            <li><Link href="/bit/branchen" className="text-slate-500 hover:text-[#1e4a7a]">Branchen</Link></li>
            <li><Link href="/bit/unternehmen" className="text-slate-500 hover:text-[#1e4a7a]">Die BIT</Link></li>
            <li><Link href="/bit/qualitaet" className="text-slate-500 hover:text-[#1e4a7a]">Qualität & Zertifikate</Link></li>
            <li><Link href="/bit/kontakt" className="text-slate-500 hover:text-[#1e4a7a]">Kontakt</Link></li>
            <li><Link href="/bit/warenkorb" className="text-slate-500 hover:text-[#1e4a7a]">Anfrage / Warenkorb</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Kontakt</h3>
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

      <div className="border-t border-slate-200">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {COMPANY.legalName}. Alle Rechte vorbehalten.</span>
          <span>{COMPANY.register} · Geschäftsführer: {COMPANY.managingDirector}</span>
        </div>
      </div>
    </footer>
  );
}
