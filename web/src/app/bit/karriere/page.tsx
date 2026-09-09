import type { Metadata } from "next";
import Link from "next/link";
import {
  Apple,
  BadgeEuro,
  Coffee,
  CupSoda,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Laptop,
  Lightbulb,
  Mail,
  PartyPopper,
  Phone,
  PiggyBank,
  Trophy,
  Users,
} from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";
import { getCmsJobs } from "../_data/misc-server";


// Seite alle 5 Minuten im Hintergrund erneuern (ISR) – Besucher bekommen
// immer die zwischengespeicherte Fassung statt auf die Datenbank zu warten.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/bit/karriere" },
  title: "Karriere",
  description:
    "Karriere bei der BIT: Vertrieb, Lagerist und Ausbildung zum Kaufmann/zur Kauffrau für Groß- und Außenhandelsmanagement – beim familiären Spezialisten für Schrumpf- und Isolierschläuche.",
};

/** Offene Stellen – Fallback, falls das CMS (bit_jobs) nicht erreichbar ist. */
const JOBS = [
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

/** Benefits – Wortlaut laut Kundenvorgabe, ergänzt um bestehende Punkte. */
const BENEFITS = [
  {
    icon: BadgeEuro,
    title: "Faires Gehalt & Provisionen",
    text: "Ein faires Gehalt und interessante Provisionsmodelle.",
  },
  {
    icon: Trophy,
    title: "Leistungsorientierte Prämien",
    text: "Leistung wird bei uns gesehen – und honoriert.",
  },
  {
    icon: Dumbbell,
    title: "Eigener Fitnessbereich",
    text: "Ein eigener Fitnessbereich, der genau wie unsere hauseigene Sonnenbank auch in der Freizeit genutzt werden darf.",
  },
  {
    icon: Coffee,
    title: "Voll ausgestattete Küche",
    text: "Eine voll ausgestattete Küche inklusive einer hochmodernen Kaffeemaschine.",
  },
  {
    icon: Apple,
    title: "Frisches Obst & Gemüse",
    text: "Täglich frisches Obst und Gemüse für deine Gesundheit.",
  },
  {
    icon: CupSoda,
    title: "Softgetränke für alle",
    text: "Eine große Auswahl an Softgetränken für das gesamte Personal.",
  },
  {
    icon: Laptop,
    title: "Moderner Arbeitsplatz",
    text: "Mit unserer fortschrittlichen IT-Struktur wird die Arbeit leichter und macht mehr Spaß.",
  },
  {
    icon: Lightbulb,
    title: "Jeder Jeck ist anders",
    text: "Individuelle Entwicklung unterstützen wir, eigene Ideen können jederzeit eingebracht werden und Probleme werden schnellstmöglich gelöst.",
  },
  {
    icon: PiggyBank,
    title: "Wir denken an Ihre Zukunft",
    text: "Zuschüsse bei vermögenswirksamen Leistungen und betrieblicher Altersvorsorge über die gesetzlichen Vorgaben hinaus.",
  },
];

const ENGAGEMENT = [
  { icon: GraduationCap, text: "Ausbildungsbetrieb seit Gründung" },
  { icon: Users, text: "Praktika für Schüler aus Schulen der Umgebung" },
  { icon: Lightbulb, text: "Fortbildungsmöglichkeiten" },
  { icon: HeartPulse, text: "Betriebliche Gesundheitsförderung" },
  { icon: PartyPopper, text: "Firmen-Events" },
];

export default async function KarrierePage() {
  const content = await getContent();
  // CMS-first: Stellen aus bit_jobs; Fallback ist die eingebaute Liste.
  const jobs = await getCmsJobs(JOBS);
  return (
    <>
      {/* Hero */}
      {/* Heller Hero – einheitlich mit den übrigen Seiten (Kundenvorgabe). */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Karriere</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {c(content, "karriere.title", "Karriere bei der BIT")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            {c(
              content,
              "karriere.intro",
              "Vertrieb, Lager oder Ausbildung: Werden Sie Teil eines familiären Teams beim Spezialisten für Schrumpf- und Isolierschläuche in Swisttal-Heimerzheim.",
            )}
          </p>
          {/* Sprungmarken zu den Stellen */}
          <div className="mt-6 flex flex-wrap gap-2">
            {jobs.map((j) => (
              <a
                key={j.id}
                href={`#${j.id}`}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
              >
                {j.id === "ausbildung" ? "Ausbildung" : j.title.replace("Verstärkung im Bereich ", "")}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Offene Stellen */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Offene Stellen
        </h2>
        <div className="mt-8 space-y-8">
          {jobs.map((job) => (
            <article
              key={job.id}
              id={job.id}
              className="max-w-3xl scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-7 sm:p-9"
            >
              <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {job.title}
              </h3>
              <p className="mt-3 font-medium leading-relaxed text-[#1e4a7a]">{job.intro}</p>
              {job.text.map((t) => (
                <p key={t} className="mt-4 leading-relaxed text-slate-700">
                  {t}
                </p>
              ))}
              <p className="mt-5 font-semibold text-slate-900">{job.aufgabenTitel}</p>
              <ul className="mt-3 space-y-2.5">
                {job.aufgaben.map((t) => (
                  <li key={t} className="flex gap-3 leading-relaxed text-slate-700">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                      aria-hidden="true"
                    />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 leading-relaxed text-slate-700">{job.schluss}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-3xl leading-relaxed text-slate-700">
          Sie finden sich in einem dieser Profile wieder? Oder sehen hier den Job, den Sie
          anstreben? Dann freuen wir uns jetzt schon darauf, Sie persönlich kennen zu lernen.
        </p>

        {/* Bewerbung */}
        <div className="mt-10 max-w-3xl rounded-3xl bg-[#0f2742] px-8 py-10">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Kontaktieren Sie uns</h2>
          <p className="mt-3 leading-relaxed text-slate-300">
            Kontaktieren Sie uns unter 02254 – 96 10 31 oder senden Sie uns Ihre Bewerbung an
            s.widera@bit-gmbh.de – Ihr Ansprechpartner ist Herr Simon Widera.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
              <a href="tel:+4922549610-31" className="hover:text-white">
                02254 – 96 10 31
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#38bdf8]" aria-hidden="true" />
              <a href="mailto:s.widera@bit-gmbh.de" className="hover:text-white">
                s.widera@bit-gmbh.de
              </a>
            </li>
          </ul>
          <a
            href={`mailto:s.widera@bit-gmbh.de?subject=${encodeURIComponent("Bewerbung bei der BIT")}`}
            className="mt-6 inline-flex rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
          >
            Jetzt bewerben
          </a>
        </div>
      </section>

      {/* Wer sind wir? + Benefits */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Wer sind wir?
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Die {COMPANY.shortName} ist ein familiäres, erfolgreiches Unternehmen, welches auf den
              Vertrieb von Schrumpf- u. Isolierschläuchen spezialisiert ist. Unsere aktuell 25
              Mitarbeiter bilden abteilungsübergreifend ein dynamisches Team, in den Bereichen
              Einkauf, Vertrieb, Verwaltung, Lager und Produktion.
            </p>
            <p className="mt-4 leading-relaxed text-slate-700">
              Sie möchten mehr über die {COMPANY.shortName} erfahren?{" "}
              <Link href="/bit/unternehmen" className="text-[#1e4a7a] underline hover:no-underline">
                Lernen Sie die BIT kennen
              </Link>
              .
            </p>
            <h2 className="mt-10 text-2xl font-bold tracking-tight text-slate-900">Benefits</h2>
            <p className="mt-3 leading-relaxed text-slate-700">
              Neben spannenden Aufgaben können wir auch mit einigen Benefits punkten:
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl font-medium leading-relaxed text-slate-800">
            Werden Sie Teil unseres Teams und starten Sie mit uns in eine noch erfolgreichere
            Zukunft!
          </p>
        </div>
      </section>

      {/* Wir engagieren uns umfassend */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Wir engagieren uns umfassend
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENGAGEMENT.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5 text-slate-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#38bdf8]/15 text-[#1d4ed8]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="self-center font-medium">{text}</span>
            </li>
          ))}
        </ul>

        {/* Gleichstellungshinweis (Fußnote zum * in den Überschriften) */}
        <p className="mt-12 max-w-4xl border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-600">
          * Um Ihnen den Lesefluss zu erleichtern, beschränken wir uns im Textverlauf auf die
          Verwendung männlicher Bezeichnungen sowie die entsprechenden Personal- und
          Possessivpronomen. Wir betonen ausdrücklich, dass diese Begriffe funktionsbezogen und
          nicht geschlechterbezogen zu verstehen sind, da bei uns alle Menschen – unabhängig von
          Geschlecht, Nationalität, ethnischer und sozialer Herkunft, Religion/Weltanschauung,
          Behinderung, Alter sowie sexueller Orientierung – gleichermaßen willkommen sind. In
          unserem Fokus stehen gegenseitiger Respekt und Wertschätzung sowie Spaß und Motivation an
          der Arbeit.
        </p>
      </section>
    </>
  );
}
