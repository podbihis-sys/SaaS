import type { Metadata } from "next";
import Link from "next/link";
import {
  Apple,
  ArrowRight,
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
import { JOBS, jobShortLabel } from "../_data/jobs";
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
      {/* Hero – dunkel, einheitlich mit den übrigen Unterseiten (Kundenvorgabe). */}
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Karriere</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {c(content, "karriere.title", "Karriere bei der BIT")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "karriere.intro",
              "Vertrieb, Lager oder Ausbildung: Werden Sie Teil eines familiären Teams beim Spezialisten für Schrumpf- und Isolierschläuche in Swisttal-Heimerzheim.",
            )}
          </p>
          {/* Direkteinstieg zu den Stellen-Unterseiten */}
          <div className="mt-6 flex flex-wrap gap-2">
            {jobs.map((j) => (
              <Link
                key={j.id}
                href={`/bit/karriere/${j.id}`}
                className="rounded-full border border-slate-600 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-[#38bdf8] hover:text-[#38bdf8]"
              >
                {jobShortLabel(j)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offene Stellen – Übersicht, jede Stelle hat ihre eigene Unterseite */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Offene Stellen
        </h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/bit/karriere/${job.id}`}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-colors hover:border-[#1e4a7a]"
            >
              <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#1e4a7a]">
                {job.title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-slate-600">{job.intro}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                Zur Stellenausschreibung
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
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
              <Link href="/bit/die-bit" className="text-[#1e4a7a] underline hover:no-underline">
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
