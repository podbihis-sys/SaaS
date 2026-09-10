import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Heart, History, Target, Users } from "lucide-react";
import { COMPANY, INDUSTRIES, industryHref } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";


// Seite alle 5 Minuten im Hintergrund erneuern (ISR) – Besucher bekommen
// immer die zwischengespeicherte Fassung statt auf die Datenbank zu warten.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/bit/die-bit" },
  title: "Die BIT",
  description:
    "BIT – seit 1996 spezialisierter Hersteller und Lieferant für Schrumpf-, Isolier- und Geflechtschläuche aus Swisttal-Heimerzheim.",
};

// Meilensteine – übernommen von bit-gmbh.de/die-bit/.
const milestones = [
  { year: "1996", text: "Gründung der BIT – der Start erfolgte aus zwei Containerbüros heraus." },
  { year: "1997 & 2000", text: "Der TÜV bestätigt unser Qualitätsmanagement mit der Verleihung der Zertifikate nach DIN EN ISO 9001." },
  { year: "2001", text: "Umzug in neue Büro- und Produktionsräume mit deutlich mehr Lager- und Produktionsfläche." },
  { year: "2007", text: "Eröffnung eines zweiten Zentrallagers – ein weiterer wichtiger Schritt für Lieferfähigkeit und Lagerkapazität." },
  { year: "2013", text: "Über 17 Jahre Branchenerfahrung, ein durchdachtes Lieferprogramm und kundenorientierter Service." },
  { year: "2016", text: "Die BIT blickt auf 20 Jahre erfolgreiche Firmengeschichte zurück." },
  { year: "2019", text: "Re-Zertifizierung durch den TÜV Rheinland nach DIN EN ISO 9001:2015 – ohne Beanstandung." },
  { year: "2021", text: "25 Jahre BIT – ein Vierteljahrhundert Unternehmensgeschichte." },
  { year: "Heute", text: "30-jähriges Jubiläum: Über 1.000 Standardartikel und kundenspezifische Lösungen – weltweit im Einsatz von der Automobilindustrie bis zur Medizintechnik." },
];

export default async function UnternehmenPage() {
  const content = await getContent();
  return (
    <>
      {/* Heller Hero – einheitlich mit den übrigen Seiten (Kundenvorgabe). */}
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Unternehmen</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {c(content, "unternehmen.title", "Die BIT")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "unternehmen.intro",
              `Seit ${COMPANY.foundedYear} ist die ${COMPANY.shortName} aus ${COMPANY.city} ein verlässlicher Partner renommierter Unternehmen für Schrumpfschläuche, Isolier- und Schutzschläuche, Kunststoffbefestigung und Kabelbinderlösungen.`,
            )}
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: History, title: "Erfahrung seit 1996", text: "Fast drei Jahrzehnte Know-how in Werkstoffen und Verarbeitung." },
            { icon: Factory, title: "Eigene Konfektion", text: "Sechs Produktionslinien für Zuschnitt, Bedruckung und Konfektionierung." },
            { icon: Target, title: "Kundenorientiert", text: "Umfassende Lagerhaltung, Standardartikel meist in 24 Stunden." },
            { icon: Users, title: "Branchenübergreifend", text: "Von Automotive bis Medizintechnik – partnerschaftlich beraten." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Unsere Entwicklung</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-700">
            {c(
              content,
              "unternehmen.entwicklung",
              "Seit der Gründung 1996 hat sich die BIT zu einem der führenden Anbieter für Schrumpfprodukte, Isolier- und Schutzschläuche entwickelt. Angefangen von einem eigenwilligen Start aus zwei Containerbüros heraus, über den Umzug in ein neuerrichtetes Bürohaus mit angegliederter Lagerhalle bis hin zum Aufbau eigener Produktionsstraßen.",
            )}
          </p>
          <div className="mt-10 space-y-6 border-l-2 border-[#1e4a7a]/20 pl-6">
            {milestones.map((m) => (
              <div key={m.year} className="relative">
                <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-[#1e4a7a]" />
                <div className="text-sm font-bold text-[#1e4a7a]">{m.year}</div>
                <p className="mt-1 max-w-2xl text-slate-700">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-20">
        <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Soziales Engagement</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {c(content, "unternehmen.soziales.title", "Verantwortung, die wir leben")}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              {c(
                content,
                "unternehmen.soziales.text",
                "Soziales Engagement ist ein zentrales Element der BIT Unternehmenskultur. Seit Jahren unterstützen wir verschiedene gemeinnützige Organisationen – darüber hinaus haben wir 2021 für die Betroffenen der Flutkatastrophe in Rheinland-Pfalz und NRW gespendet.",
              )}
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                "Swisttaler Tafel e.V.",
                "Aktion Lichtblicke e.V.",
                "SOS-Kinderdorf e.V.",
                "Arbeiter-Samariter-Bund Deutschland e.V.",
                "Stiftung Deutsche KinderKrebshilfe",
              ].map((org) => (
                <li key={org} className="flex items-center gap-2 text-sm text-slate-700">
                  <Heart className="h-4 w-4 shrink-0 text-[#38bdf8]" /> {org}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Karriere</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {c(content, "unternehmen.karriere.title", "Werden Sie Teil des BIT-Teams")}
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              {c(
                content,
                "unternehmen.karriere.text",
                "Ob Berufsstarter, Verkaufs-Profi oder Quereinsteiger: Wir suchen Persönlichkeiten, die sich über abwechslungsreiche Arbeit in einem klar strukturierten, bunten Team freuen und denen eine sehr gute Arbeitsatmosphäre genauso wichtig ist wie Professionalität und Service gegenüber dem Kunden.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bit/karriere"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
              >
                Zu den offenen Stellen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Branchen & Märkte</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Unsere Produkte sind dort im Einsatz, wo elektrische Isolation, mechanischer Schutz und
          zuverlässige Bündelung gefragt sind.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {INDUSTRIES.map((i) => (
            <Link
              key={i}
              href={industryHref(i)}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
            >
              {i}
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/bit/branchen"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Alle Branchen ansehen <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/bit/produkte"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sortiment ansehen
          </Link>
        </div>
      </section>
    </>
  );
}
