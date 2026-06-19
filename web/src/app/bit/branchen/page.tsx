import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";
import { ProductIllustration } from "../_components/product-illustration";
import { Reveal } from "../_components/reveal";
import { BreadcrumbLd } from "../_components/breadcrumb-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/branchen" },
  title: "Branchen",
  description:
    "Schrumpf-, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder von BIT Bierther im Einsatz: Automotive, Energietechnik, Hausgeräte, Medizintechnik, Maschinenbau, Lichttechnik und Sicherheitstechnik.",
};

interface Industry {
  id: string;
  name: string;
  /** Untertitel von der Branchen-Übersicht. */
  tagline: string;
  /** Bildunterüberschrift / Schwerpunkt der Detailseite. */
  focus: string;
  image: string;
  imageAlt: string;
  text: string[];
}

const INDUSTRIES: Industry[] = [
  {
    id: "energietechnik",
    name: "Energietechnik / Erneuerbare Energien",
    tagline: "Schrumpf- und Isolationsprodukte für die Energietechnik",
    focus: "Elektrische Isolierung, thermischer Schutz, Abrieb- oder Klapperschutz",
    image: "/bit/branchen/energietechnik.jpg",
    imageAlt: "Energietechnik / Erneuerbare Energien",
    text: [
      "In der schnell wachsenden Branche der erneuerbaren Energien sind zuverlässige und langlebige Materialien unerlässlich. Die BIT Bierther GmbH hebt sich mit ihren hochqualitativen Schrumpf- und Isolierschläuchen hervor.",
      "Besonders gefragt sind hochtemperaturbeständige Schrumpfschläuche aus Polyolefin, Silikon, PTFE und FEP sowie UV-beständige Werkstoffe wie Kynar® (PVDF), PVC und Polyolefin – ideal für Solarenergie, Windkraft und weitere Anwendungen der Energiewirtschaft.",
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    tagline: "Schutzschläuche, Schrumpfschläuche und Kennzeichnungslösungen für den Automotive-Markt",
    focus: "Kabelbündelung, Kabelschutz, Kabelkennzeichnung",
    image: "/bit/branchen/automotive.jpg",
    imageAlt: "Automotive",
    text: [
      "Seit 1996 ist die BIT Bierther GmbH in der Automobilindustrie für Produkte bekannt, die höchste Qualitätsansprüche erfüllen – sei es bei Schrumpfschläuchen, Kabelschutzschläuchen oder Geflechtschläuchen.",
      "Unsere Kunden können auf maßgeschneiderte Lösungen zählen, die perfekt auf ihre Bedürfnisse abgestimmt sind. Wir bieten komplette Systemlösungen ebenso wie individuelle Sonderanfertigungen – die langjährige Treue internationaler Automobilzulieferer bestätigt unseren Ansatz.",
    ],
  },
  {
    id: "hausgeraete",
    name: "Hausgeräte",
    tagline: "Hochwertiger Kabelschutz für die Hausgeräte-Industrie",
    focus: "Kabelbinder, Kabelbefestigungs- und Kabelkennzeichnungslösungen",
    image: "/bit/branchen/hausgeraete.jpg",
    imageAlt: "Hausgeräte",
    text: [
      "Der Sektor Hausgeräte stellt uns mit seinem vielfältigen Einsatzspektrum und seinen heterogenen Ansprüchen vor immer neue Herausforderungen.",
      "Die BIT bietet individuelle und maßgeschneiderte Lösungen für Ihr Unternehmen und liefert qualitativ hochwertige Produkte gemäß internationaler Normen und Spezifikationen (u. a. UL 224 VW-1, UL 1441, DIN 40628, DIN 40621).",
    ],
  },
  {
    id: "medizintechnik",
    name: "Medizintechnik",
    tagline: "Lösungen aus biokompatiblen Kunststoffen für die Medizintechnik",
    focus: "Zertifizierte Schläuche für die Medizintechnik",
    image: "/bit/branchen/medizintechnik.jpg",
    imageAlt: "Medizintechnik",
    text: [
      "Die Medizintechnik stellt höchste Ansprüche an die Qualität und die Zuverlässigkeit der eingesetzten Produkte.",
      "Die BIT verfügt über ein weit verzweigtes internationales Partnernetzwerk und kann Ihrem Unternehmen erstklassige, individuelle Lösungen und zertifizierte Produkte anbieten.",
    ],
  },
  {
    id: "maschinenbau",
    name: "Maschinen- und Anlagenbau",
    tagline: "Wellrohre, Geflechtschläuche, Isolier- und Schutzschläuche für Nutzfahrzeuge, Land- und Baumaschinen",
    focus: "Robuste Lösungen für den Maschinen- und Anlagenbau",
    image: "/bit/branchen/maschinenbau.jpg",
    imageAlt: "Maschinen- und Anlagenbau",
    text: [
      "Lösungen zum Kabelschutz, zur Kabelbündelung und zur Kennzeichnung für den Maschinen- und Anlagenbau gehören seit unseren Anfängen zu unseren Kernkompetenzen.",
      "Wenn hohe thermische oder chemische Beständigkeiten, Abriebfestigkeit oder sehr hohe Bündelbereiche gefordert werden, empfehlen wir Ihnen eine Vielzahl unserer Standardprodukte – oder fertigen individuelle Sonderanfertigungen für Ihre Anwendung.",
    ],
  },
  {
    id: "licht",
    name: "Licht- und Beleuchtungstechnik",
    tagline: "Optimale Befestigungs-, Kennzeichnungs- und Schutzlösungen",
    focus: "Robuster Kabelschutz und filigrane Kennzeichnungen",
    image: "/bit/branchen/licht.jpg",
    imageAlt: "Licht- und Beleuchtungstechnik",
    text: [
      "Mit Schutz- und Schrumpfschläuchen für die Licht- und Beleuchtungstechnik kennen wir uns aus. Ob für Industrieleuchten, Objektleuchten, Zimmerleuchten, den Messebau oder für Illuminationen – wir haben für viele Anwendungen passende Produkte.",
      "Die Anforderungen reichen vom robusten Kabelschutz bis hin zur filigranen, halogenfreien Kennzeichnung von Einzeladern.",
    ],
  },
  {
    id: "sicherheit",
    name: "Sicherheitstechnik",
    tagline: "BIT Produkte für höchste Sicherheit",
    focus: "Sicherer Halt mit BIT Schrumpfschläuchen",
    image: "/bit/branchen/sicherheit.jpg",
    imageAlt: "Sicherheitstechnik",
    text: [
      "Gerade in der Sicherheitstechnik sind die Anforderungen an die Qualität und Zuverlässigkeit der eingesetzten Produkte besonders hoch. Die BIT steht Ihnen kompetent und beratend zur Seite.",
      "Besonders gefragt sind unsere mittel- und dickwandigen Schrumpfschläuche (auf Wunsch kleberbeschichtet), die für sicheren Halt auf unterschiedlichsten Oberflächen sorgen – etwa bei Draht-, Faser- und Kunststoffseilen, Ladungssicherungen, Hebezeugen oder PSA-Ausrüstung.",
    ],
  },
];

export default async function BranchenPage() {
  const content = await getContent();
  return (
    <>
      <BreadcrumbLd items={[{ name: "Home", path: "/bit" }, { name: "Branchen", path: "/bit/branchen" }]} />
      {/* ----------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-[#0f2742]">
        <div className="absolute inset-0 opacity-20">
          <ProductIllustration category="geflechtschlauch" fit="cover" className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2742] via-[#0f2742]/90 to-[#0f2742]/60" />
        <div className="container relative py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Branchen</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {c(content, "branchen.hero.title", "Branchen, die auf BIT vertrauen")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "branchen.hero.intro",
              `Die ${COMPANY.legalName} ist seit ${COMPANY.foundedYear} ein zuverlässiger Ansprechpartner in unterschiedlichsten Branchen. Mit Schrumpf-, Isolier-, Glasseiden- und Geflechtschläuchen, Wellrohren und Kabelbindern sowie der technischen Kompetenz unserer Mitarbeiter entwickeln wir individuelle Lösungen für Ihr Anliegen.`,
            )}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- Industry sections */}
      <section className="container space-y-16 py-20 sm:space-y-24">
        {INDUSTRIES.map((ind, i) => (
          <Reveal key={ind.id} className="scroll-mt-24" delay={0}>
            <div
              id={ind.id}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ind.image}
                  alt={ind.imageAlt}
                  className="aspect-[21/9] w-full bg-slate-50 object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">{ind.name}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {ind.focus}
                </h2>
                <p className="mt-2 font-medium text-[#1e4a7a]">{ind.tagline}</p>
                <div className="mt-4 space-y-3 leading-relaxed text-slate-600">
                  {ind.text.map((t, idx) => (
                    <p key={idx}>{t}</p>
                  ))}
                </div>
                <Link
                  href="/bit/produkte"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
                >
                  Passende Produkte ansehen
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="border-t border-slate-200 bg-[#0f2742] py-16">
        <div className="container flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Ihre Branche ist nicht dabei?</h2>
            <p className="mt-2 max-w-xl text-slate-300">
              {c(
                content,
                "branchen.cta.text",
                "Sie brauchen Beratung bei der richtigen Auswahl des Produkts? Melden Sie sich gerne bei uns – via Chat, E-Mail oder Telefon.",
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Link
              href="/bit/kontakt"
              className="rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
            >
              Beratung anfragen
            </Link>
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <Phone className="h-4 w-4" /> {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
