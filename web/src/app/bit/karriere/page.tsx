import type { Metadata } from "next";
import Link from "next/link";
import {
  Coffee,
  Dumbbell,
  GraduationCap,
  Handshake,
  HeartPulse,
  Laptop,
  Mail,
  PartyPopper,
  Phone,
  PiggyBank,
  Sprout,
  Users,
} from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/karriere" },
  title: "Karriere",
  description:
    "Karriere bei der BIT Bierther GmbH: Jobs im Vertrieb und Ausbildung im Familienunternehmen für Schrumpf- & Isolierschlauchtechnik in Swisttal-Heimerzheim.",
};

const BENEFITS = [
  { icon: Laptop, text: "Moderner Arbeitsplatz mit fortschrittlicher IT-Infrastruktur" },
  { icon: Sprout, text: "Individuelle Förderung und Weiterentwicklung" },
  { icon: Coffee, text: "Freigetränke und voll ausgestattete Küche" },
  { icon: Dumbbell, text: "Fitnessbereich und Sonnenbank im Haus" },
  { icon: PiggyBank, text: "Zuschüsse zu vermögenswirksamen Leistungen & Altersvorsorge" },
  { icon: PartyPopper, text: "Firmenevents und ein familiäres Miteinander" },
];

const ENGAGEMENT = [
  { icon: GraduationCap, text: "Ausbildungsbetrieb seit Gründung" },
  { icon: Users, text: "Praktika für Schülerinnen und Schüler aus der Region" },
  { icon: Sprout, text: "Fort- und Weiterbildungsmöglichkeiten" },
  { icon: HeartPulse, text: "Betriebliche Gesundheitsförderung" },
];

export default async function KarrierePage() {
  const content = await getContent();
  return (
    <>
      <section className="relative overflow-hidden bg-[#0f2742]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2742] via-[#0f2742]/95 to-[#1e4a7a]/80" />
        <div className="container relative py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Karriere</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {c(content, "karriere.title", "Werden Sie Teil des BIT-Teams")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "karriere.intro",
              "Die BIT Bierther GmbH ist ein rund 25-köpfiges Familienunternehmen mit den Bereichen Einkauf, Vertrieb, Verwaltung, Lager und Produktion. Ob Berufsstarter, Verkaufs-Profi oder Quereinsteiger – bei uns erwartet Sie abwechslungsreiche Arbeit in einem klar strukturierten, bunten Team.",
            )}
          </p>
        </div>
      </section>

      {/* Vertrieb bei der BIT */}
      <section className="container py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Vertrieb</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Vertrieb bei der BIT
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Unser Vertriebsteam betreut einen Stamm von über 6.000 Kundenkontakten – von der
              technischen Beratung über die Angebotserstellung bis zur langfristigen
              Kundenbeziehung. Als Mitarbeiter im Vertrieb sind Sie die Kommunikationsbrücke
              zwischen unseren Kunden und den internen Bereichen Einkauf, Lager und Produktion.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Aufbau und Pflege langfristiger Kundenbeziehungen",
                "Technische Beratung zu Schrumpf-, Isolier- und Geflechtschläuchen",
                "Angebotserstellung und Auftragsbegleitung",
                "Enge Zusammenarbeit mit Einkauf, Dispo und Produktion",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-slate-700">
                  <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-[#38bdf8]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Ausbildung</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Ausbildung bei der BIT
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Wir sind Ausbildungsbetrieb seit der Gründung 1996. Bei uns lernen Sie alle Bereiche
              eines spezialisierten Handels- und Produktionsunternehmens kennen – vom Einkauf über
              Vertrieb und Verwaltung bis zu Lager und Konfektion. Wir engagieren uns umfassend:
            </p>
            <ul className="mt-6 space-y-3">
              {ENGAGEMENT.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-slate-700">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#38bdf8]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Was wir bieten</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm leading-relaxed text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bewerbung */}
      <section className="container py-20">
        <div className="rounded-3xl bg-[#0f2742] px-8 py-12 sm:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Interesse? Bewerben Sie sich jetzt.
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                Senden Sie Ihre Bewerbung – gerne auch initiativ – an unseren Vertriebsleiter
                Simon Widera. Wir freuen uns darauf, Sie kennenzulernen.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#38bdf8]" />
                  <a href="tel:+4922549610-31" className="hover:text-white">+49 (0)2254 9610-31</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#38bdf8]" />
                  <a href="mailto:s.widera@bit-gmbh.de" className="hover:text-white">s.widera@bit-gmbh.de</a>
                </li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:s.widera@bit-gmbh.de?subject=${encodeURIComponent("Bewerbung bei der BIT Bierther GmbH")}`}
                className="rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
              >
                Jetzt bewerben
              </a>
              <Link
                href="/bit/unternehmen"
                className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Die BIT kennenlernen
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          {COMPANY.legalName} · {COMPANY.street} · {COMPANY.zip} {COMPANY.city}
        </p>
      </section>
    </>
  );
}
