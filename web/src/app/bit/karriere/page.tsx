import type { Metadata } from "next";
import Link from "next/link";
import {
  Coffee,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Laptop,
  Lightbulb,
  Mail,
  PartyPopper,
  Phone,
  PiggyBank,
  Users,
} from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/karriere" },
  title: "Karriere",
  description:
    "Verstärkung im Bereich Vertrieb gesucht: Karriere bei der BIT, dem familiären Spezialisten für Schrumpf- und Isolierschläuche in Swisttal-Heimerzheim.",
};

const AUFGABEN = [
  "nachhaltige Kundenbeziehungen aufzubauen und zu pflegen",
  "technische Beratung zu bieten, deren Grundlage Sie zuvor von unseren erfahrenen Verkäufern vermittelt bekommen",
  "kommunikative Schnittstelle zwischen Ihren Kunden und den Kollegen zu sein, die Ihnen den Rücken freihalten, so dass Sie sich voll auf Ihre Vertriebsaufgaben konzentrieren können",
];

const BENEFITS = [
  {
    icon: Laptop,
    title: "Moderner Arbeitsplatz",
    text: "mit unserer fortschrittlichen IT-Struktur wird die Arbeit leichter und macht mehr Spaß",
  },
  {
    icon: Lightbulb,
    title: "Jeder Jeck ist anders",
    text: "Individuelle Entwicklung unterstützen wir, eigene Ideen können jederzeit eingebracht werden und Probleme werden schnellstmöglich gelöst",
  },
  {
    icon: Coffee,
    title: "Für das leibliche Wohl ist gesorgt",
    text: "wir bieten kostenlose Getränke und eine vollausgestattete Küche",
  },
  {
    icon: Dumbbell,
    title: "Hier ist es auch außerhalb der Arbeit schön",
    text: "nutzen Sie Angebote wie den betriebseigenen Fitnessbereich und eine Sonnenbank",
  },
  {
    icon: PiggyBank,
    title: "Wir denken an Ihre Zukunft",
    text: "Zuschüsse bei vermögenswirksamen Leistungen und betrieblicher Altersvorsorge über die gesetzlichen Vorgaben hinaus",
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
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f2742]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2742] via-[#0f2742]/95 to-[#1e4a7a]/80" />
        <div className="container relative py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Karriere</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {c(content, "karriere.title", "Verstärkung im Bereich Vertrieb*")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "karriere.intro",
              "Sie haben eine Leidenschaft für Kommunikation? Auf neue Menschen zuzugehen macht Ihnen Spaß? Sie zeichnet Offenheit und Dienstleistungsorientierung aus? Dann sind Sie genau, was wir suchen …",
            )}
          </p>
        </div>
      </section>

      {/* Stellenausschreibung */}
      <section className="container py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Wir suchen Verstärkung im Bereich Vertrieb*
          </h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Bauen Sie Ihren eigenen Arbeitsbereich auf, in dem Sie Bestandskunden und die, die es
            noch werden wollen, bei der zukünftigen Zusammenarbeit betreuen.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            Greifen Sie unter anderem auf ein Portfolio von über 6000 Kontakten in unserem System
            zu, welches zu Ihrer freien Verfügung steht.
          </p>

          <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-900">Was bieten wir?</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Ihre zukünftigen Aufgaben könnten darin bestehen,
          </p>
          <ul className="mt-4 space-y-3">
            {AUFGABEN.map((t) => (
              <li key={t} className="flex gap-3 leading-relaxed text-slate-700">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38bdf8]"
                  aria-hidden="true"
                />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 leading-relaxed text-slate-700">
            Ob Berufsstarter, Verkaufs-Profi oder Quereinsteiger – alle Ausgangssituationen bringen
            neue, positive Einflüsse ins Unternehmen. Wir suchen Persönlichkeiten, die sich über
            abwechslungsreiche Arbeit in einem klar strukturierten, bunten Team freuen und denen
            eine sehr gute Arbeitsatmosphäre genauso wichtig ist wie Professionalität und Service
            gegenüber dem Kunden.
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">
            Sie finden sich in diesem Profil wieder? Oder sehen hier den Job, den Sie anstreben?
            Dann freuen wir uns jetzt schon darauf, Sie persönlich kennen zu lernen.
          </p>
        </div>

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
            href={`mailto:s.widera@bit-gmbh.de?subject=${encodeURIComponent("Bewerbung – Vertrieb bei der BIT")}`}
            className="mt-6 inline-flex rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
          >
            Jetzt bewerben
          </a>
        </div>
      </section>

      {/* Wer sind wir? */}
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
            <p className="mt-8 leading-relaxed text-slate-700">
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
