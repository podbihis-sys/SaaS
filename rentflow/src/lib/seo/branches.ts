/**
 * Programmatic SEO branches (prompt §12, Prio 2). Each renders /verleih/[branche]
 * with its own title/H1/FAQ. MVP focus: Eventausstattung.
 */
export interface Branche {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  faq: { q: string; a: string }[];
}

export const BRANCHES: Branche[] = [
  {
    slug: "eventausstattung",
    name: "Eventausstattung",
    h1: "Buchungssystem für Eventausstattungs-Verleih",
    intro:
      "Zelte, Mobiliar, Technik, Geschirr: Verwalte dein Event-Inventar mit Live-Verfügbarkeit, sichere Anzahlung und Kaution per Stripe und schließe Doppelbuchungen technisch aus.",
    faq: [
      {
        q: "Eignet sich RentFlow für saisonale Event-Spitzen?",
        a: "Ja. Mengen pro Artikel, transaktionale Verfügbarkeit und automatische Erinnerungen halten auch in der Hochsaison den Überblick.",
      },
    ],
  },
  {
    slug: "partyzelt",
    name: "Partyzelt-Verleih",
    h1: "Online-Buchung für Partyzelt- & Festzelt-Verleih",
    intro:
      "Vermiete Partyzelte und Festzelte mit Online-Buchung, geprüfter Verfügbarkeit und gesicherter Kaution — ohne Telefon-Pingpong.",
    faq: [
      {
        q: "Kann ich pro Zeltgröße mehrere Einheiten führen?",
        a: "Ja, jeder Artikel hat eine Menge. Die Verfügbarkeit wird je Zeitraum exakt gezählt.",
      },
    ],
  },
  {
    slug: "huepfburg",
    name: "Hüpfburg-Verleih",
    h1: "Buchungssystem für Hüpfburg-Verleih",
    intro:
      "Hüpfburgen online vermieten: Live-Verfügbarkeit, Anzahlung und Kaution direkt auf dein Konto, automatische Abhol- und Rückgabe-Erinnerungen.",
    faq: [
      {
        q: "Wird die Kaution automatisch erstattet?",
        a: "Ja, beim Markieren als zurückgegeben wird die Kaution automatisch über Stripe erstattet.",
      },
    ],
  },
  {
    slug: "veranstaltungstechnik",
    name: "Veranstaltungstechnik",
    h1: "Verleih-Software für Veranstaltungstechnik",
    intro:
      "Licht, Ton, Bühne, LED: Verleihe Veranstaltungstechnik mit verlässlicher Verfügbarkeitsprüfung und gesicherter Zahlung.",
    faq: [
      {
        q: "Kann ich teure Technik mit höherer Kaution absichern?",
        a: "Ja, Kaution wird pro Artikel hinterlegt und bei der Buchung mit erhoben.",
      },
    ],
  },
  {
    slug: "mobiliar",
    name: "Mobiliar-Verleih",
    h1: "Online-Buchung für Mobiliar- & Möbelverleih",
    intro:
      "Tische, Stühle, Loungemöbel: Vermiete Mobiliar mit Mengenführung, Live-Verfügbarkeit und Online-Zahlung.",
    faq: [
      {
        q: "Funktioniert das auch bei großen Stückzahlen?",
        a: "Ja. Die Verfügbarkeit zählt überlappende Buchungen transaktional, auch bei hunderten Einheiten.",
      },
    ],
  },
];

export function getBranche(slug: string): Branche | undefined {
  return BRANCHES.find((b) => b.slug === slug);
}
