import type { JobPosting } from "./misc-server";

/**
 * Offene Stellen – statischer Fallback, falls das CMS (bit_jobs) nicht
 * erreichbar ist. Wird von der Karriere-Übersicht und den einzelnen
 * Stellen-Unterseiten (/bit/karriere/[slug]) gemeinsam genutzt.
 */
export const JOBS: JobPosting[] = [
  {
    id: "vertrieb",
    title: "Verstärkung im Bereich Vertrieb*",
    intro:
      "Sie haben eine Leidenschaft für Kommunikation? Auf neue Menschen zuzugehen macht Ihnen Spaß? Sie zeichnet Offenheit und Dienstleistungsorientierung aus? Dann sind Sie genau, was wir suchen …",
    text: [
      "Bauen Sie Ihren eigenen Arbeitsbereich auf, in dem Sie Bestandskunden und die, die es noch werden wollen, bei der zukünftigen Zusammenarbeit betreuen.",
      "Greifen Sie unter anderem auf ein Portfolio von über 6000 Kontakten in unserem System zu, welches zu Ihrer freien Verfügung steht.",
    ],
    aufgabenTitel: "Ihre zukünftigen Aufgaben könnten darin bestehen,",
    aufgaben: [
      "nachhaltige Kundenbeziehungen aufzubauen und zu pflegen",
      "technische Beratung zu bieten, deren Grundlage Sie zuvor von unseren erfahrenen Verkäufern vermittelt bekommen",
      "kommunikative Schnittstelle zwischen Ihren Kunden und den Kollegen zu sein, die Ihnen den Rücken freihalten, so dass Sie sich voll auf Ihre Vertriebsaufgaben konzentrieren können",
    ],
    schluss:
      "Ob Berufsstarter, Verkaufs-Profi oder Quereinsteiger – alle Ausgangssituationen bringen neue, positive Einflüsse ins Unternehmen. Wir suchen Persönlichkeiten, die sich über abwechslungsreiche Arbeit in einem klar strukturierten, bunten Team freuen und denen eine sehr gute Arbeitsatmosphäre genauso wichtig ist wie Professionalität und Service gegenüber dem Kunden.",
  },
  {
    id: "lagerist",
    title: "Lagerist*",
    intro:
      "Sie packen gerne mit an, arbeiten sorgfältig und behalten auch bei vielen Aufträgen den Überblick? Dann verstärken Sie unser Lagerteam in Swisttal-Heimerzheim.",
    text: [
      "In unserem Lager sorgen Sie dafür, dass über 1.000 Standardartikel zuverlässig ihren Weg zum Kunden finden – in der Regel innerhalb von 24 Stunden.",
    ],
    aufgabenTitel: "Ihre Aufgaben:",
    aufgaben: [
      "Wareneingang inklusive Kontrolle und Einlagerung",
      "Kommissionierung, Verpackung und Versand der Kundenaufträge",
      "Unterstützung der Konfektionierung (Zuschnitt und Verpackungseinheiten)",
      "Bestandspflege und Mitarbeit bei Inventuren",
    ],
    schluss:
      "Erfahrung im Lager ist von Vorteil, ein Staplerschein wünschenswert – wichtiger sind uns Zuverlässigkeit, Sorgfalt und Teamgeist. Auch motivierte Quereinsteiger sind herzlich willkommen.",
  },
  {
    id: "ausbildung",
    title: "Ausbildung bei der BIT: Kaufmann/-frau für Groß- und Außenhandelsmanagement",
    intro:
      "Du willst nach der Schule richtig durchstarten? Bei uns lernst du den Großhandel von Grund auf – vom Einkauf über Vertrieb und Lagerlogistik bis zum Rechnungswesen.",
    text: [
      "Als Ausbildungsbetrieb seit der Gründung begleiten wir dich durch alle Abteilungen: Du übernimmst früh eigene Aufgaben, bekommst feste Ansprechpartner und arbeitest von Anfang an im Tagesgeschäft mit.",
    ],
    aufgabenTitel: "Das erwartet dich:",
    aufgaben: [
      "Einkauf, Vertrieb, Auftragsbearbeitung und Disposition kennenlernen",
      "Kundenanfragen, Angebote und Aufträge selbstständig bearbeiten",
      "Lagerlogistik und Warenwirtschaft in der Praxis erleben",
      "Rechnungswesen und moderne Warenwirtschafts-IT",
    ],
    schluss:
      "Die Ausbildung dauert in der Regel drei Jahre und findet im Wechsel mit der Berufsschule statt. Bei guter Leistung stehen die Chancen auf Übernahme sehr gut.",
  },
];

/** Kurzlabel für Chips und Übersichtslisten. */
export function jobShortLabel(job: JobPosting): string {
  return job.id === "ausbildung"
    ? "Ausbildung"
    : job.title.replace("Verstärkung im Bereich ", "");
}
