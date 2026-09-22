import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Printer, ShoppingCart } from "lucide-react";
import { COMPANY } from "../../_data/catalog";
import { roleEn } from "../../_data/terms-en";
import { MapEmbed } from "../../_components/map-embed";
import { getCmsTeam, type TeamMember } from "../../_data/misc-server";

/** Englische Kontaktseite – gleicher Aufbau wie /bit/kontakt. */

export const revalidate = 300;

// Exakte Koordinaten des BIT-Gebäudes, Dützhofer Str. 7 (OpenStreetMap, Gewerbegebiet Heimerzheim).
const MAP = { lat: 50.72287, lon: 6.91813 };
const MAP_BBOX = `${MAP.lon - 0.014}%2C${MAP.lat - 0.009}%2C${MAP.lon + 0.014}%2C${MAP.lat + 0.009}`;

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
  alternates: { canonical: "/bit/en/contact" },
  title: "Contact",
  description: `Contact ${COMPANY.shortName} in ${COMPANY.city}: phone ${COMPANY.phone}, email ${COMPANY.email}.`,
};

export default async function ContactPage() {
  const teamFallback: TeamMember[] = [
    ...TEAM.map((m) => ({ ...m, cssOnly: false })),
    { name: "css", role: "Administration", phone: "", email: "", cssOnly: true },
  ];
  const team = await getCmsTeam(teamFallback);
  const visible = team.filter((m) => !m.cssOnly);
  const cssOnly = team.find((m) => m.cssOnly);
  const mapsQuery = encodeURIComponent(`${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}`);

  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Contact</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            We advise you personally
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            Standard articles or custom processing – talk to us. For a specific inquiry, simply put
            your articles together in the cart.
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
                {COMPANY.zip} {COMPANY.city}, Germany
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
              <ContactRow icon={Clock}>{COMPANY.hours.replace("Uhr", "").trim()}</ContactRow>
            </ul>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-[#1e4a7a]" />
                <h3 className="font-semibold text-slate-900">Submit a specific inquiry</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Add articles in all required sizes to the cart and send everything in a single
                inquiry – we usually reply within 24 hours.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/bit/en/products"
                  className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
                >
                  Browse products
                </Link>
                <Link
                  href="/bit/en/cart"
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  Open cart
                </Link>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              {COMPANY.register} · Managing Director: {COMPANY.managingDirector}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <MapEmbed
              title="BIT location"
              locale="en"
              className="h-full min-h-[420px] w-full"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}&layer=mapnik&marker=${MAP.lat}%2C${MAP.lon}`}
            />
            <a
              href={`https://www.openstreetmap.org/search?query=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-50 px-4 py-3 text-center text-sm font-medium text-[#1e4a7a] hover:underline"
            >
              Open on the map
            </a>
          </div>
        </div>
      </section>

      {/* Our team */}
      <section className="border-t border-slate-200">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Our team</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Your contacts at BIT
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Personal, competent and solution-oriented – this is how you reach us directly. Central
            fax number: {COMPANY.fax}.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="font-semibold text-slate-900">{m.name}</div>
                <div className="mt-0.5 text-sm text-[#1e4a7a]">{roleEn(m.role)}</div>
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
                <div className="mt-0.5 text-sm text-[#1e4a7a]">{roleEn(cssOnly.role)}</div>
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

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="container py-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Directions, delivery & service
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-700">
            Our headquarters are located at {COMPANY.street}, {COMPANY.zip} {COMPANY.city} –
            conveniently situated between Bonn and Euskirchen. Standard articles are usually
            dispatched within 24 hours; for processing, printing and special materials we are happy
            to prepare an individual quote. Contact us Mon–Fri 8:00–17:00 by phone, email or via
            the cart – we advise you with technical expertise and a focus on solutions.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/bit/en/products", title: "Products", text: "More than 1,000 standard articles in 9 categories." },
              { href: "/bit/en/competences", title: "Competences", text: "Cutting, printing & special materials." },
              { href: "/bit/en/industrial-sectors", title: "Industrial Sectors", text: "Solutions from automotive to medical technology." },
              { href: "/bit/en/news", title: "News", text: "New products and application tips." },
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
                q: "How fast do you deliver?",
                a: "Standard articles are usually available from stock and are mostly dispatched within 24 hours. For processing or custom products we state a binding delivery date with the quote.",
              },
              {
                q: "Can I order tubing cut to size?",
                a: "Yes. We cut, print and process heat-shrink, insulating and fiberglass sleeves to your specification – on six production lines at our site in Heimerzheim.",
              },
              {
                q: "How do I submit an inquiry?",
                a: "Add the desired articles in all required sizes to the cart and send everything in a single inquiry. We reply with an individual quote – usually within 24 hours.",
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
