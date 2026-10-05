import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Printer, ShoppingCart } from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";
import { ContactForm } from "../_components/contact-form";
import { getCmsTeam, type TeamMember } from "../_data/misc-server";


// Seite alle 5 Minuten im Hintergrund erneuern (ISR) – Besucher bekommen
// immer die zwischengespeicherte Fassung statt auf die Datenbank zu warten.
export const revalidate = 300;

/** Team-Kontakte – Fallback, falls das CMS (bit_team) nicht erreichbar ist. */
const TEAM: { name: string; role: string; phone: string; email: string }[] = [
  { name: "Frank Bierther", role: "Geschäftsführer", phone: "+49 (0)2254 9610-0", email: "info@bit-gmbh.de" },
  { name: "Kimberley Bierther", role: "Prokuristin / Assistentin Geschäftsleitung", phone: "+49 (0)2254 9610-36", email: "k.bierther@bit-gmbh.de" },
  { name: "Simon Widera", role: "Vertriebsleitung", phone: "+49 (0)2254 9610-31", email: "s.widera@bit-gmbh.de" },
  { name: "Waldemar Rempel", role: "Vertriebsleitung", phone: "+49 (0)2254 9610-41", email: "w.rempel@bit-gmbh.de" },
  { name: "Thomas Peters", role: "Verkauf", phone: "+49 (0)2254 9610-34", email: "t.peters@bit-gmbh.de" },
  { name: "Stefan Emig", role: "Verkauf", phone: "+49 (0)2254 9610-32", email: "s.emig@bit-gmbh.de" },
  { name: "Torsten Brustkern", role: "Verkauf / QMB", phone: "+49 (0)2254 9610-66", email: "t.brustkern@bit-gmbh.de" },
  { name: "Miguel Etzbauer", role: "Verkauf", phone: "+49 (0)2254 9610-29", email: "m.etzbauer@bit-gmbh.de" },
  { name: "Dimitri Krieger", role: "Betriebsleitung", phone: "+49 (0)2254 9610-61", email: "betriebsleitung@bit-gmbh.de" },
  { name: "Sabine Gröhling", role: "Auftragssachbearbeitung / Dispo", phone: "+49 (0)2254 9610-26", email: "s.groehling@bit-gmbh.de" },
  { name: "Nina Weber", role: "Auftragssachbearbeitung / Dispo", phone: "+49 (0)2254 9610-35", email: "n.weber@bit-gmbh.de" },
  { name: "Marc Weber", role: "Einkauf", phone: "+49 (0)2254 9610-12", email: "m.weber@bit-gmbh.de" },
  { name: "Gisela Di Bernardo", role: "Prokuristin / Rechnungswesen", phone: "+49 (0)2254 9610-30", email: "g.dibernardo@bit-gmbh.de" },
  { name: "Silke Richter", role: "Administration", phone: "+49 (0)2254 9610-11", email: "s.richter@bit-gmbh.de" },
];

export const metadata: Metadata = {
  alternates: { canonical: "/bit/kontakt" },
  title: "Kontakt",
  description: `Kontakt zur ${COMPANY.shortName} in ${COMPANY.city}: Telefon ${COMPANY.phone}, E-Mail ${COMPANY.email}.`,
};

export default async function KontaktPage() {
  const content = await getContent();
  // CMS-first: Team aus bit_team; css_only-Einträge erscheinen nur als
  // CSS-content (nicht indexierbar) und werden unten separat gerendert.
  const teamFallback: TeamMember[] = [
    ...TEAM.map((m) => ({ ...m, cssOnly: false })),
    { name: "css", role: "Administration", phone: "", email: "", cssOnly: true },
  ];
  const team = await getCmsTeam(teamFallback);
  const visible = team.filter((m) => !m.cssOnly);
  const cssOnly = team.find((m) => m.cssOnly);

  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Kontakt</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            {c(content, "kontakt.title", "Wir beraten Sie persönlich")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "kontakt.intro",
              "Ob Standardartikel oder Sonderkonfektion – sprechen Sie uns an. Für eine konkrete Anfrage stellen Sie Ihre Artikel einfach im Warenkorb zusammen.",
            )}
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{COMPANY.legalName}</h2>
            <ul className="mt-6 space-y-5">
              <ContactRow icon={MapPin}>
                {COMPANY.street}
                <br />
                {COMPANY.zip} {COMPANY.city}, {COMPANY.country}
              </ContactRow>
              <ContactRow icon={Phone}>
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="hover:text-[#1e4a7a]">
                  {COMPANY.phone}
                </a>
              </ContactRow>
              <ContactRow icon={Printer}>Fax {COMPANY.fax}</ContactRow>
              <ContactRow icon={Mail}>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-[#1e4a7a]">
                  {COMPANY.email}
                </a>
              </ContactRow>
              <ContactRow icon={Clock}>{COMPANY.hours}</ContactRow>
            </ul>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-[#1e4a7a]" />
                <h3 className="font-semibold text-slate-900">Konkrete Anfrage stellen</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Legen Sie Artikel in allen benötigten Größen in den Warenkorb und senden Sie alles
                in einer einzigen Anfrage – wir antworten in der Regel innerhalb von 24 Stunden.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/bit/produkte"
                  className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
                >
                  Zum Sortiment
                </Link>
                <Link
                  href="/bit/warenkorb"
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  Warenkorb öffnen
                </Link>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              {COMPANY.register} · Geschäftsführer: {COMPANY.managingDirector}
            </p>
          </div>

          <ContactForm locale="de" />
        </div>
      </section>

      {/* Unser Team */}
      <section className="border-t border-slate-200">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Unser Team</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Ihre Ansprechpartner bei der BIT
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Persönlich, kompetent und lösungsorientiert – so erreichen Sie uns direkt. Zentrale
            Fax-Nummer: {COMPANY.fax}.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="font-semibold text-slate-900">{m.name}</div>
                <div className="mt-0.5 text-sm text-[#1e4a7a]">{m.role}</div>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                    <a href={`tel:${m.phone.replace(/[^+\d]/g, "")}`} className="hover:text-[#1e4a7a]">
                      {m.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                    <a href={`mailto:${m.email}`} className="break-all hover:text-[#1e4a7a]">
                      {m.email}
                    </a>
                  </li>
                </ul>
              </div>
            ))}
            {/* Auf Kundenwunsch steht dieser Kontakt nur als CSS-content im
                Stylesheet (bit.css) – nicht im indexierbaren HTML-Text. */}
            {cssOnly && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="bit-nf-name font-semibold text-slate-900" />
              <div className="mt-0.5 text-sm text-[#1e4a7a]">{cssOnly.role}</div>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="bit-nf-phone" />
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="bit-nf-email break-all" />
                </li>
              </ul>
            </div>
            )}
          </div>
        </div>
      </section>

    </>
  );
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-slate-700">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1e4a7a]/10 text-[#1e4a7a]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
