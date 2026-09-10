import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BreadcrumbLd } from "../_components/breadcrumb-ld";
import { getCmsFaq, type FaqItem } from "../_data/misc-server";

// FAQ kommt aus dem CMS und erneuert sich alle 5 Minuten (ISR).
export const revalidate = 300;
import { Reveal } from "../_components/reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/faq" },
  title: "FAQ – Häufig gestellte Fragen",
  description:
    "Häufig gestellte Fragen an die BIT: Produkte & Sortiment, Konfektionierung, Lieferung & Logistik, Qualität & Zertifizierung sowie Beratung & Kontakt.",
};

/**
 * FAQ – Fragen und Antworten im Wortlaut der Vorgabe „BIT Bierther FAQ"
 * (überarbeitet vom BIT-Team, 09/2026), gegliedert in fünf Gruppen.
 */
const FAQ_GROUPS: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Produkte & Sortiment",
    items: [
      {
        q: "Welche Produkte bietet die BIT Bierther GmbH an?",
        a: "Schrumpfschlauch, Isolierschlauch, Silikonschlauch, Glasseidenschlauch, Geflechtschlauch, Wellrohr, Kabelbinder sowie Verarbeitungsgeräte und weitere Zubehörprodukte.",
      },
      {
        q: "Für welche Branchen sind die Produkte geeignet?",
        a: "Energietechnik / Erneuerbare Energien, Automotive, Hausgeräte, Medizintechnik, Maschinen- und Anlagenbau, Licht- und Beleuchtungstechnik sowie Sicherheitstechnik.",
      },
      {
        q: "Bieten Sie auch Schrumpfschlauch mit UL-Zulassung an?",
        a: "Ja, verschiedene Schrumpf- und Isolierschläuche sind mit UL-Zulassung erhältlich.",
      },
      {
        q: "Gibt es Schrumpfschlauch in verschiedenen Farben oder transparent?",
        a: "Ja, farbige und transparente Varianten sind Teil des Sortiments.",
      },
    ],
  },
  {
    group: "Konfektionierung & individuelle Lösungen",
    items: [
      {
        q: "Kann ich Schrumpfschlauch nach individuellem Maß zuschneiden lassen?",
        a: "Ja, Schrumpf- und Isolierschläuche werden auf Kundenwunsch abgelängt bzw. geschnitten.",
      },
      {
        q: "Ist eine Bedruckung der Schläuche möglich?",
        a: "Ja, zur Kennzeichnung von Kabeln und Leitungen können Schläuche individuell bedruckt und perforiert werden.",
      },
      {
        q: "Bieten Sie individuelle Verpackungseinheiten oder eigene Etiketten an?",
        a: "Ja, individuelle Verpackungen, Etiketten sowie Direktversand an Endkunden sind möglich.",
      },
    ],
  },
  {
    group: "Lieferung & Logistik",
    items: [
      {
        q: "Wie schnell erfolgt die Lieferung von Standardartikeln?",
        a: "In der Regel innerhalb von 24 Stunden.",
      },
      {
        q: "Ist auch eine Just-in-Time-Belieferung möglich?",
        a: "Ja, neben Sofort-Bestellungen werden auch Termin- und Just-in-Time-Bestellungen angeboten.",
      },
    ],
  },
  {
    group: "Qualität & Zertifizierung",
    items: [
      {
        q: "Welche Zertifizierungen hat die BIT Bierther GmbH?",
        a: "DIN ISO 9001:2015 sowie UL-Zulassungen (UL File E196690 und E362210).",
      },
      {
        q: "Sind die Produkte REACH- und RoHS-konform?",
        a: "Ja, alle Produkte entsprechen den REACH- und RoHS-Vorgaben.",
      },
      {
        q: "Wie wird die Produktqualität sichergestellt?",
        a: "Durch laufende Kontrollen in Wareneingang, Produktion und Warenausgang sowie Dokumentation via Messprotokollen und Werksprüfzeugnissen.",
      },
    ],
  },
  {
    group: "Beratung & Kontakt",
    items: [
      {
        q: "Gibt es einen festen Ansprechpartner für Anfragen?",
        a: "Ja, Kunden erhalten feste Ansprechpartner für individuelle technische Beratung.",
      },
      {
        q: "Wie kann ich Kontakt aufnehmen?",
        a: "Per Telefon, E-Mail oder über das Kontaktformular auf der Website (mit Kategorieauswahl je nach Produktbereich).",
      },
      {
        q: "Wie lange gibt es die BIT Bierther GmbH schon?",
        a: "Seit fast 30 Jahren am Markt.",
      },
    ],
  },
];

export default async function FaqPage() {
  // CMS-first: Fragen aus bit_faq; Fallback ist die eingebaute Liste.
  const flat: FaqItem[] = FAQ_GROUPS.flatMap((g) =>
    g.items.map((f) => ({ group: g.group, q: f.q, a: f.a })),
  );
  const cms = await getCmsFaq(flat);
  const groups: { group: string; items: { q: string; a: string }[] }[] = [];
  for (const item of cms) {
    const last = groups[groups.length - 1];
    if (last && last.group === item.group) last.items.push({ q: item.q, a: item.a });
    else groups.push({ group: item.group, items: [{ q: item.q, a: item.a }] });
  }
  return (
    <>
      <BreadcrumbLd items={[{ name: "Home", path: "/bit" }, { name: "FAQ", path: "/bit/faq" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: groups.flatMap((g) =>
              g.items.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            ),
          }),
        }}
      />

      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">FAQ</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Häufig gestellte Fragen
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            Antworten rund um Produkte, Konfektionierung, Lieferung, Qualität und Kontakt. Ihre
            Frage ist nicht dabei? Sprechen Sie uns an – wir helfen gerne weiter.
          </p>
          {/* Sprungmarken zu den Themenblöcken */}
          <div className="mt-6 flex flex-wrap gap-2">
            {groups.map((g, i) => (
              <a
                key={g.group}
                href={`#faq-${i}`}
                className="rounded-full border border-slate-600 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-[#38bdf8] hover:text-[#38bdf8]"
              >
                {g.group}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl space-y-12">
          {groups.map((g, i) => (
            <div key={g.group} id={`faq-${i}`} className="scroll-mt-32">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {g.group}
              </h2>
              <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
                {g.items.map((f) => (
                  <Reveal key={f.q} as="div" className="py-5">
                    <h3 className="text-lg font-semibold text-slate-900">{f.q}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{f.a}</p>
                  </Reveal>
                ))}
              </div>
            </div>
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
