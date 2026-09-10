import type { Metadata } from "next";
import Link from "next/link";
import {
  Car,
  GraduationCap,
  Heart,
  Leaf,
  MapPin,
  Package,
  Recycle,
  ShieldCheck,
  Sun,
  Timer,
  Zap,
} from "lucide-react";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";


// Seite alle 5 Minuten im Hintergrund erneuern (ISR) – Besucher bekommen
// immer die zwischengespeicherte Fassung statt auf die Datenbank zu warten.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/bit/nachhaltigkeit" },
  title: "Nachhaltigkeit",
  description:
    "Nachhaltigkeit bei der BIT: langlebige Produkte, RoHS- & REACH-Konformität, regionale Verantwortung und Ausbildung am Standort Swisttal-Heimerzheim.",
};

const PILLARS = [
  // Energie & Standort – Punkte laut Kundenvorgabe (09/2026).
  {
    icon: Zap,
    title: "Wir setzen auf Ökostrom",
    text: "Verwaltung, Lager und Konfektion arbeiten am Standort Swisttal-Heimerzheim mit Strom aus erneuerbaren Energien.",
  },
  {
    icon: Sun,
    title: "Eigene Photovoltaik-Anlage",
    text: "Die PV-Anlage auf unserem Firmendach erzeugt einen großen Teil unseres Strombedarfs selbst – die BIT ist damit weitgehend energieautark.",
  },
  {
    icon: Car,
    title: "Elektrischer Fuhrpark",
    text: "Unser Fuhrpark fährt elektrisch und lädt direkt am Standort – mit Sonnenstrom vom eigenen Dach.",
  },
  {
    icon: Timer,
    title: "Langlebige Produkte",
    text: "Schrumpf- und Isolierschläuche schützen Kabel und Verbindungen über Jahrzehnte – Beständigkeit gegen Temperatur, Chemikalien und UV verlängert die Lebensdauer ganzer Baugruppen und vermeidet vorzeitigen Austausch.",
  },
  {
    icon: ShieldCheck,
    title: "RoHS & REACH",
    text: "Unsere Standardartikel erfüllen die geltenden Umwelt- und Stoffverbotsrichtlinien. Halogenfreie Werkstoffe reduzieren im Brandfall korrosive und giftige Gase.",
  },
  {
    icon: Package,
    title: "Bedarfsgerechte Konfektion",
    text: "Zuschnitt und Bedruckung nach Bedarf heißt: Sie beziehen genau die Menge, die Sie benötigen. Das reduziert Verschnitt und Lagerabfälle – bei Ihnen und bei uns.",
  },
  {
    icon: Recycle,
    title: "Ressourcenschonende Prozesse",
    text: "Kurze Wege zwischen Lager, Konfektion und Versand an einem Standort, wiederverwendete Verpackungen und gebündelte Sendungen sparen Material und Transportkilometer.",
  },
  {
    icon: MapPin,
    title: "Regionale Verantwortung",
    text: "Als Familienunternehmen sind wir seit 1996 in Swisttal-Heimerzheim verwurzelt – mit Arbeitsplätzen, Praktika und Aufträgen für die Region.",
  },
  {
    icon: GraduationCap,
    title: "Ausbildung & Mitarbeiter",
    text: "Ausbildungsbetrieb seit Gründung: Wir investieren in Nachwuchs, Weiterbildung und betriebliche Gesundheitsförderung – Nachhaltigkeit beginnt beim Team.",
  },
];

const SOCIAL = [
  "Swisttaler Tafel e.V.",
  "Aktion Lichtblicke e.V.",
  "SOS-Kinderdorf e.V.",
  "Arbeiter-Samariter-Bund Deutschland e.V.",
  "Stiftung Deutsche KinderKrebshilfe",
];

export default async function NachhaltigkeitPage() {
  const content = await getContent();
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">
            <Leaf className="h-4 w-4" /> Nachhaltigkeit
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white">
            {c(content, "nachhaltigkeit.title", "Verantwortung für Produkt, Region und Team")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "nachhaltigkeit.intro",
              "Nachhaltigkeit ist für uns kein Etikett, sondern gelebte Praxis: langlebige Produkte, konforme Werkstoffe, bedarfsgerechte Konfektion und ein verlässliches Miteinander – am Standort Swisttal-Heimerzheim und darüber hinaus.",
            )}
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#38bdf8]/15 text-[#1d4ed8]">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">
              Soziales Engagement
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Wir geben etwas zurück
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Soziales Engagement ist ein zentrales Element der BIT-Unternehmenskultur. Seit
              Jahren unterstützen wir gemeinnützige Organisationen – 2021 haben wir zudem für die
              Betroffenen der Flutkatastrophe in Rheinland-Pfalz und NRW gespendet.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {SOCIAL.map((org) => (
                <li key={org} className="flex items-center gap-2 text-sm text-slate-700">
                  <Heart className="h-4 w-4 shrink-0 text-[#38bdf8]" /> {org}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
              Qualität & Nachweise
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Dokumentiert statt behauptet
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Unser Qualitätsmanagement ist seit 1997 nach DIN EN ISO 9001 zertifiziert.
              Konformitätserklärungen zu RoHS und REACH sowie technische Datenblätter stellen wir
              Ihnen auf Anfrage gerne zur Verfügung.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bit/qualitaet"
                className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
              >
                Mehr zur Qualität
              </Link>
              <Link
                href="/bit/kontakt"
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Nachweis anfragen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
