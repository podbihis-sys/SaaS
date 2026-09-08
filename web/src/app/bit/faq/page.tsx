import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { BreadcrumbLd } from "../_components/breadcrumb-ld";
import { Reveal } from "../_components/reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/faq" },
  title: "FAQ – Häufige Fragen",
  description:
    "Antworten auf häufige Fragen zu Schrumpfschläuchen, Lieferzeiten, Konfektion, Bedruckung und Anfragen bei der BIT.",
};

/**
 * Eigene FAQ-Unterseite (Kundenvorgabe). Die Fragen werden inhaltlich noch
 * vom BIT-Team überarbeitet – Struktur und Seite stehen dafür bereit.
 */
const FAQ = [
  {
    q: "Was ist ein Schrumpfschlauch und wofür wird er verwendet?",
    a: "Ein Schrumpfschlauch ist ein Kunststoffschlauch, der sich bei Wärme auf einen definierten Durchmesser zusammenzieht. Er wird zur elektrischen Isolation, zur Bündelung und Kennzeichnung von Kabeln sowie zum mechanischen Schutz und zur Abdichtung von Verbindungen eingesetzt.",
  },
  {
    q: "Welche Schrumpfraten bietet die BIT an?",
    a: "Wir führen Schrumpfschläuche mit Schrumpfraten von 1,3:1 bis 6:1 – aus Polyolefin, PVC, PTFE, FEP, PVDF (Kynar®), Silikon und Elastomer, dünn- bis dickwandig und optional mit Innenkleber.",
  },
  {
    q: "Wie schnell liefert BIT?",
    a: "Standardartikel sind in der Regel ab Lager verfügbar und werden meist innerhalb von 24 Stunden versendet. Für Konfektion, Bedruckung und Sonderwerkstoffe nennen wir Ihnen mit dem Angebot einen verbindlichen Liefertermin.",
  },
  {
    q: "Bietet BIT Konfektion und Bedruckung an?",
    a: "Ja. Über sechs Produktionsstrecken schneiden, bedrucken und konfektionieren wir Schrumpf-, Isolier- und Glasseidenschläuche nach Ihren Vorgaben – vom einzelnen Zuschnitt bis zur Serie.",
  },
  {
    q: "In welchen Branchen werden die Produkte eingesetzt?",
    a: "Unsere Schläuche, Wellrohre und Kabelbinder kommen u. a. in Automotive, Energietechnik, Hausgeräten, Medizintechnik, Maschinen- und Anlagenbau, Licht- und Sicherheitstechnik zum Einsatz.",
  },
  {
    q: "Verkauft BIT auch an Privatkunden?",
    a: `Nein. Die ${COMPANY.legalName} beliefert ausschließlich Gewerbekunden.`,
  },
  {
    q: "Wie stelle ich eine Anfrage?",
    a: "Legen Sie die gewünschten Artikel in allen benötigten Größen in den Warenkorb und senden Sie alles in einer einzigen Anfrage. Wir antworten mit einem individuellen Angebot – in der Regel innerhalb von 24 Stunden.",
  },
];

export default function FaqPage() {
  return (
    <>
      <BreadcrumbLd items={[{ name: "Home", path: "/bit" }, { name: "FAQ", path: "/bit/faq" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">FAQ</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Häufige Fragen
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Antworten rund um Produkte, Lieferung, Konfektion und Anfragen. Ihre Frage ist nicht
            dabei? Sprechen Sie uns an – wir helfen gerne weiter.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
          {FAQ.map((f) => (
            <Reveal key={f.q} as="div" className="py-5">
              <h2 className="text-lg font-semibold text-slate-900">{f.q}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{f.a}</p>
            </Reveal>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-3">
          <Link href="/bit/kontakt" className="bit-btn bit-btn-dark">
            <span>Kontakt aufnehmen</span>
            <ArrowRight className="bit-arrow h-4 w-4" />
          </Link>
          <Link href="/bit/produkte" className="bit-btn bit-btn-outline">
            <span>Zum Sortiment</span>
          </Link>
        </div>
      </section>
    </>
  );
}
