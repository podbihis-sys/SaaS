import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Printer, ShoppingCart } from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";

// Exakte Koordinaten des BIT-Gebäudes, Dützhofer Str. 7 (OpenStreetMap, Gewerbegebiet Heimerzheim).
const MAP = { lat: 50.72287, lon: 6.91813 };
const MAP_BBOX = `${MAP.lon - 0.014}%2C${MAP.lat - 0.009}%2C${MAP.lon + 0.014}%2C${MAP.lat + 0.009}`;

/** Team-Kontakte – übernommen von der bisherigen Website bit-gmbh.de. */
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
  { name: "Nicole Faßbender", role: "Administration", phone: "+49 (0)2254 9610-27", email: "n.fassbender@bit-gmbh.de" },
];

export const metadata: Metadata = {
  alternates: { canonical: "/bit/kontakt" },
  title: "Kontakt",
  description: `Kontakt zur ${COMPANY.legalName} in ${COMPANY.city}: Telefon ${COMPANY.phone}, E-Mail ${COMPANY.email}.`,
};

export default async function KontaktPage() {
  const content = await getContent();
  const mapsQuery = encodeURIComponent(
    `${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}`,
  );

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Kontakt</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {c(content, "kontakt.title", "Wir beraten Sie persönlich")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
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

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <iframe
              title="Standort BIT Bierther GmbH"
              className="h-full min-h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}&layer=mapnik&marker=${MAP.lat}%2C${MAP.lon}`}
            />
            <a
              href={`https://www.openstreetmap.org/search?query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-50 px-4 py-3 text-center text-sm font-medium text-[#1e4a7a] hover:underline"
            >
              Auf der Karte öffnen
            </a>
          </div>
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
            {TEAM.map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="font-semibold text-slate-900">{m.name}</div>
                <div className="mt-0.5 text-sm text-[#1e4a7a]">{m.role}</div>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`tel:${m.phone.replace(/[^+\d]/g, "")}`} className="hover:text-[#1e4a7a]">
                      {m.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <a href={`mailto:${m.email}`} className="break-all hover:text-[#1e4a7a]">
                      {m.email}
                    </a>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="container py-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {c(content, "kontakt.service.title", "Anfahrt, Lieferung & Service")}
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-700">
            {c(
              content,
              "kontakt.service.text",
              `Unser Firmensitz liegt in ${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city} – verkehrsgünstig zwischen Bonn und Euskirchen erreichbar. Standardartikel versenden wir in der Regel innerhalb von 24 Stunden; für Konfektion, Bedruckung und Sonderwerkstoffe erstellen wir Ihnen gerne ein individuelles Angebot. Sprechen Sie uns ${COMPANY.hours} telefonisch, per E-Mail oder über den Warenkorb an – wir beraten Sie technisch fundiert und lösungsorientiert.`,
            )}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/bit/produkte", title: "Sortiment", text: "Über 1.000 Standardartikel in 9 Kategorien." },
              { href: "/bit/kompetenzen", title: "Kompetenzen", text: "Zuschnitt, Bedruckung & Sonderwerkstoffe." },
              { href: "/bit/branchen", title: "Branchen", text: "Lösungen für Automotive bis Medizintechnik." },
              { href: "/bit/news", title: "News", text: "Neuheiten und Anwendungstipps." },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#1e4a7a]"
              >
                <span className="font-semibold text-slate-900">{l.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{l.text}</span>
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                q: "Wie schnell liefern Sie?",
                a: "Standardartikel sind in der Regel ab Lager verfügbar und werden meist innerhalb von 24 Stunden versendet. Bei Konfektion oder Sonderanfertigungen nennen wir Ihnen mit dem Angebot einen verbindlichen Liefertermin.",
              },
              {
                q: "Kann ich Schläuche nach Maß bestellen?",
                a: "Ja. Wir schneiden, bedrucken und konfektionieren Schrumpf-, Isolier- und Glasseidenschläuche nach Ihren Vorgaben – über sechs Produktionsstrecken an unserem Standort in Heimerzheim.",
              },
              {
                q: "Wie stelle ich eine Anfrage?",
                a: "Legen Sie die gewünschten Artikel in allen benötigten Größen in den Warenkorb und senden Sie alles in einer einzigen Anfrage. Wir antworten mit einem individuellen Angebot – in der Regel innerhalb von 24 Stunden.",
              },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </div>
            ))}
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
