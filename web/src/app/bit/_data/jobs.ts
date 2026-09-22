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
    titleEn: "Reinforcement for our sales team*",
    introEn:
      "Do you have a passion for communication? Do you enjoy approaching new people? Are you characterised by openness and a service mindset? Then you are exactly who we are looking for …",
    textEn: [
      "Build up your own area of responsibility in which you look after existing customers – and those who want to become customers – in their future cooperation with us.",
      "Among other things, you will have access to a portfolio of more than 6,000 contacts in our system, which is at your free disposal.",
    ],
    aufgabenTitelEn: "Your future tasks could include",
    aufgabenEn: [
      "building and maintaining lasting customer relationships",
      "providing technical advice, the basics of which our experienced sales staff will teach you beforehand",
      "being the communicative interface between your customers and the colleagues who have your back, so that you can concentrate fully on your sales tasks",
    ],
    schlussEn:
      "Career starter, sales professional or career changer – every starting point brings new, positive influences into the company. We are looking for personalities who enjoy varied work in a clearly structured, diverse team and who value a very good working atmosphere as much as professionalism and service towards the customer.",
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
    titleEn: "Warehouse operative*",
    introEn:
      "Do you like to lend a hand, work carefully and keep track even when there are many orders? Then join our warehouse team in Swisttal-Heimerzheim.",
    textEn: [
      "In our warehouse you make sure that more than 1,000 standard articles reliably find their way to the customer – usually within 24 hours.",
    ],
    aufgabenTitelEn: "Your tasks:",
    aufgabenEn: [
      "Goods receipt including inspection and putaway",
      "Picking, packing and dispatch of customer orders",
      "Support for processing (cutting to length and packaging units)",
      "Stock maintenance and participation in stocktaking",
    ],
    schlussEn:
      "Warehouse experience is an advantage and a forklift licence is desirable – but reliability, diligence and team spirit matter more to us. Motivated career changers are also very welcome.",
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
    titleEn: "Apprenticeship at BIT: Wholesale and Foreign Trade Management Clerk",
    introEn:
      "Want to get off to a flying start after school? With us you learn wholesale from the ground up – from purchasing through sales and warehouse logistics to accounting.",
    textEn: [
      "As a training company since our foundation, we guide you through all departments: you take on your own tasks early, have dedicated contact persons and work in day-to-day business right from the start.",
    ],
    aufgabenTitelEn: "What awaits you:",
    aufgabenEn: [
      "Get to know purchasing, sales, order processing and scheduling",
      "Handle customer inquiries, quotes and orders independently",
      "Experience warehouse logistics and merchandise management in practice",
      "Accounting and modern merchandise management IT",
    ],
    schlussEn:
      "The apprenticeship usually takes three years and alternates with vocational school. With good performance, the chances of being taken on are very good.",
  },
];

/** Kurzlabel für Chips und Übersichtslisten. */
export function jobShortLabel(job: JobPosting): string {
  return job.id === "ausbildung"
    ? "Ausbildung"
    : job.title.replace("Verstärkung im Bereich ", "");
}

/** Grammatisch korrekte Ergänzung zu "Bewerben Sie sich …". */
export function jobApplyPhrase(job: JobPosting): string {
  switch (job.id) {
    case "vertrieb":
      return "als Vertriebler";
    case "lagerist":
      return "als Lagerist";
    case "ausbildung":
      return "für die Ausbildung";
    default:
      return "auf diese Stelle";
  }
}

/** Englisches Kurzlabel für Chips und Übersichtslisten. */
export function jobShortLabelEn(job: JobPosting): string {
  if (job.id === "ausbildung") return "Apprenticeship";
  if (job.id === "vertrieb") return "Sales";
  if (job.id === "lagerist") return "Warehouse";
  return (job.titleEn || job.title).replace("*", "");
}

/** Englische Ergänzung zu "Apply …". */
export function jobApplyPhraseEn(job: JobPosting): string {
  switch (job.id) {
    case "vertrieb":
      return "as a sales representative";
    case "lagerist":
      return "as a warehouse operative";
    case "ausbildung":
      return "for the apprenticeship";
    default:
      return "for this position";
  }
}
