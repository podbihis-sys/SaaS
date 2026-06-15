import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Printer, ShoppingCart } from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";

export const metadata: Metadata = {
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
              src={`https://www.openstreetmap.org/export/embed.html?bbox=6.88%2C50.74%2C6.96%2C50.80&layer=mapnik&marker=50.77%2C6.92`}
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
