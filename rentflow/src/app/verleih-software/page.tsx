import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verleih-Software & Buchungssystem für Eventverleih",
  description:
    "Online-Buchungssystem für Verleih-Betriebe: Live-Verfügbarkeit, Doppelbuchungs-Schutz und gesicherte Anzahlung/Kaution per Stripe. Schluss mit Excel und Telefon.",
  alternates: { canonical: "/verleih-software" },
};

const FAQ = [
  {
    q: "Wie verhindert RentFlow Doppelbuchungen?",
    a: "Jede Buchung wird transaktional mit Datenbank-Sperre angelegt und zusätzlich durch eine Datenbank-Constraint abgesichert. Zwei gleichzeitige Buchungen desselben Zeitraums sind technisch unmöglich.",
  },
  {
    q: "Wohin fließt das Geld der Mieter?",
    a: "Anzahlung und Kaution werden per Stripe Connect direkt auf das eigene Konto des Verleih-Betriebs gebucht. RentFlow hält zu keinem Zeitpunkt fremdes Geld.",
  },
  {
    q: "Wird die Kaution automatisch erstattet?",
    a: "Ja. Sobald du eine Buchung als zurückgegeben markierst, wird die Kaution automatisch über das verbundene Stripe-Konto erstattet.",
  },
  {
    q: "Was kostet RentFlow?",
    a: "Es gibt eine kostenlose Stufe (bis 3 Artikel), Solo für 79 €/Monat und Pro für 149 €/Monat. Solo und Pro sind 14 Tage kostenlos testbar.",
  },
];

export default function VerleihSoftwarePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-4xl font-bold tracking-tight">
        Verleih-Software mit Online-Buchung & Anzahlung
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Schluss mit Doppelbuchungen, Excel-Listen und Telefon-Chaos. RentFlow gibt deinem
        Verleih-Betrieb eine öffentliche Buchungsseite mit Live-Verfügbarkeit — und sichert
        Anzahlung und Kaution direkt per Stripe auf deinem eigenen Konto.
      </p>

      <div className="mt-8">
        <Link href="/login">
          <Button size="lg">Kostenlos starten</Button>
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
        <dl className="mt-6 space-y-6">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
