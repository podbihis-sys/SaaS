import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES, COMPANY } from "../_data/catalog";

export function SiteFooter() {
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
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Produkte</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/bit/produkte?kategorie=${c.id}`} className="text-slate-500 hover:text-[#1e4a7a]">
                  {c.name}
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
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {COMPANY.legalName}. Alle Rechte vorbehalten.</span>
          <span>{COMPANY.register} · Geschäftsführer: {COMPANY.managingDirector}</span>
        </div>
      </div>
    </footer>
  );
}
