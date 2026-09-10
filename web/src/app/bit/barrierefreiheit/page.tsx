import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Mail, Phone } from "lucide-react";
import { COMPANY } from "../_data/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/barrierefreiheit" },
  title: "Erklärung zur Barrierefreiheit",
  description:
    "Erklärung zur Barrierefreiheit der Website der BIT nach Barrierefreiheitsstärkungsgesetz (BFSG) und EN 301 549 / WCAG 2.1 AA.",
};

const MEASURES = [
  "Vollständige Bedienbarkeit per Tastatur, inklusive Warenkorb und Filtern",
  "Deutlich sichtbare Fokusanzeige auf allen interaktiven Elementen",
  "Sprungmarke „Zum Inhalt springen“ am Seitenanfang",
  "Aussagekräftige Alternativtexte für Produkt- und Inhaltsbilder",
  "Semantische Überschriftenstruktur mit genau einer H1 je Seite",
  "Beschriftete Formularfelder mit Kennzeichnung von Pflichtangaben",
  "Fehler- und Statusmeldungen werden Screenreadern aktiv mitgeteilt",
  "Bildwechsel im Seitenkopf ist pausierbar; Animationen respektieren die Systemeinstellung „Bewegung reduzieren“",
  "Kontrastverhältnisse nach WCAG AA (mindestens 4,5:1 für Text)",
  "Responsives Layout, nutzbar bis 400 % Zoom",
  "Deutsche Sprachauszeichnung und sprechende Seitentitel",
];

export default function BarrierefreiheitPage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="container py-14">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">
            <Accessibility className="h-4 w-4" aria-hidden="true" /> Barrierefreiheit
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
            Erklärung zur Barrierefreiheit
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Die {COMPANY.legalName} ist bemüht, ihre Website im Einklang mit dem
            Barrierefreiheitsstärkungsgesetz (BFSG) barrierefrei zugänglich zu machen.
          </p>
        </div>
      </section>

      <section className="container py-14">
        <div className="max-w-3xl space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Geltungsbereich</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Diese Erklärung gilt für die Website unter www.bit-gmbh.de einschließlich des
              Produktkatalogs und der Anfragefunktion (Warenkorb).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Stand der Vereinbarkeit</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Diese Website ist mit der Norm EN 301 549 und den Web Content Accessibility
              Guidelines (WCAG) in der Version 2.1 auf Konformitätsstufe AA{" "}
              <strong>weitgehend vereinbar</strong>. „Weitgehend vereinbar“ bedeutet, dass einzelne
              Inhalte möglicherweise noch nicht vollständig den Anforderungen entsprechen.
            </p>
            <h3 className="mt-6 font-semibold text-slate-900">Umgesetzte Maßnahmen</h3>
            <ul className="mt-3 space-y-2 text-slate-700">
              {MEASURES.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Nicht barrierefreie Inhalte</h2>
            <ul className="mt-3 space-y-3 text-slate-700">
              <li>
                <strong>Technische Datenblätter (PDF):</strong> Von Herstellern bereitgestellte
                PDF-Dokumente sind teilweise nicht barrierefrei aufbereitet. Die wesentlichen
                technischen Daten stellen wir auf jeder Produktseite zusätzlich als HTML-Tabelle
                bereit. Auf Anfrage senden wir Ihnen Datenblattinhalte in zugänglicher Form zu.
              </li>
              <li>
                <strong>Eingebettete Kartendarstellung:</strong> Die Karte auf der Kontaktseite
                wird von OpenStreetMap bereitgestellt und ist nur eingeschränkt bedienbar. Die
                vollständige Anschrift steht als Text direkt daneben.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Erstellung dieser Erklärung</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Diese Erklärung wurde am 30. Juli 2026 erstellt. Grundlage ist eine interne Prüfung
              der Website anhand der Kriterien der EN 301 549 / WCAG 2.1 AA.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-slate-900">Barrieren melden – Feedback</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Sie haben eine Barriere entdeckt oder benötigen Informationen in einer zugänglichen
              Form? Melden Sie sich gerne bei uns – wir helfen weiter und beheben Probleme so
              schnell wie möglich.
            </p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#1e4a7a]" aria-hidden="true" />
                <a href={`mailto:${COMPANY.email}`} className="text-[#1e4a7a] hover:underline">
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#1e4a7a]" aria-hidden="true" />
                <a
                  href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                  className="text-[#1e4a7a] hover:underline"
                >
                  {COMPANY.phone}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              {COMPANY.legalName} · {COMPANY.street} · {COMPANY.zip} {COMPANY.city}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Marktüberwachung</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Sind Sie mit unserer Antwort nicht zufrieden, können Sie sich an die
              Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und
              Dienstleistungen (MLBF) wenden:
            </p>
            <p className="mt-3 leading-relaxed text-slate-700">
              Marktüberwachungsstelle der Länder für die Barrierefreiheit von Produkten und
              Dienstleistungen
              <br />
              c/o Landesamt für Soziales, Jugend und Versorgung Rheinland-Pfalz
              <br />
              Baedekerstraße 2–20, 56073 Koblenz
              <br />
              <a
                href="https://www.marktueberwachung-barrierefreiheit.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1e4a7a] hover:underline"
              >
                www.marktueberwachung-barrierefreiheit.de
              </a>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-8">
            <Link
              href="/bit/kontakt"
              className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
            >
              Zum Kontakt
            </Link>
            <Link
              href="/bit/impressum"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Impressum
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
