import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FlaskConical,
  Palette,
  Printer,
  Ruler,
  Scissors,
} from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";
import { Reveal } from "../_components/reveal";
import { ProductIllustration } from "../_components/product-illustration";

export const metadata: Metadata = {
  title: "Kompetenzen",
  description:
    "Konfektion, Bedruckung, Sonderwerkstoffe (PTFE/FEP/Kynar), UL-Zulassung, farbige Schrumpfschläuche und ein breites Abmessungsspektrum: die Kompetenzen der BIT Bierther GmbH.",
};

const COMPETENCES = [
  {
    id: "abschnitte",
    icon: Scissors,
    title: "Konfektion & Schrumpfschlauch-Abschnitte",
    image: "/bit/kompetenzen/abschnitte.jpg",
    imageAlt: "Schrumpfschlauch-Abschnitte aus eigener Konfektion",
    text: "Wir schneiden und konfektionieren Schrumpf-, Isolier- und Glasseidenschläuche nach Ihren Vorgaben – mit geringen Längentoleranzen, hoher Schnittgenauigkeit und kurzen Lieferzeiten. Schläuche unter 1 mm Durchmesser schneiden wir auf Sonderlängen ab 3 mm. Realisiert über sechs Produktionsstrecken am Standort Heimerzheim.",
  },
  {
    id: "bedruckt",
    icon: Printer,
    title: "Bedruckung nach Wunsch",
    image: "/bit/kompetenzen/bedruckt.jpg",
    imageAlt: "Bedruckte Schrumpfschlauch-Abschnitte",
    text: "Ob Firmenlogo, Markenname, Barcode oder fortlaufende Seriennummer – wir bedrucken Schrumpf- und Isolierschläuche nach Ihren Anforderungen. Die Bedruckung erfolgt auf schwarzem oder farbigem Schlauch in verschiedenen Druckfarben.",
  },
  {
    id: "ptfe",
    icon: FlaskConical,
    title: "Sonderwerkstoffe PTFE, FEP & Kynar (PVDF)",
    image: "/bit/kompetenzen/ptfe.jpg",
    imageAlt: "Schrumpfschlauch aus PTFE, FEP und Kynar",
    text: "Unsere Spezial-Schrumpfschläuche aus PTFE, FEP und Kynar (PVDF) bieten exzellenten Schutz in anspruchsvollsten Umgebungen: extrem temperaturbeständig, chemikalienresistent und elektrisch isolierend – ideal für Luftfahrt, Medizintechnik, Hochspannungstechnik und industrielle Elektronik.",
  },
  {
    id: "ul",
    icon: BadgeCheck,
    title: "Schläuche mit UL-Zulassung",
    image: "/bit/kompetenzen/ul.jpg",
    imageAlt: "Schrumpf- und Isolierschläuche mit UL-224-Zulassung",
    text: "Für viele unserer Schrumpf- und Isolierschläuche bestätigen wir eine Zulassung nach UL 224. Die gelisteten Typen fallen unter das UL-Listing YDPU2.E196690 – die entsprechenden Nachweise stellen wir Ihnen auf Anfrage zur Verfügung.",
  },
  {
    id: "farbig",
    icon: Palette,
    title: "Farbige Schrumpfschläuche",
    image: "/bit/kompetenzen/farbig.jpg",
    imageAlt: "Farbige Schrumpfschläuche zur Kennzeichnung",
    text: "Neben Schwarz führen wir viele Schrumpfschlauch-Typen in zahlreichen Farben – ideal zur farblichen Kennzeichnung von Kabeln und Leitungen. Auf Wunsch produzieren wir BP 125 und BP 300 nach Kundenvorgabe in Anlehnung an RAL- oder Pantone-Farbtöne.",
  },
  {
    id: "abmessungen",
    icon: Ruler,
    title: "Große Auswahl an Abmessungen",
    image: "/bit/kompetenzen/abmessungen.jpg",
    imageAlt: "Schrumpfschläuche in vielen Abmessungen",
    text: "Von dünnwandig bis dickwandig: Unsere Schrumpfschläuche decken ein breites Spektrum an Durchmessern und Schrumpfraten ab. Weitere Sonderabmessungen sowie die Konfektionierung nach Ihren Vorgaben sind jederzeit möglich.",
  },
];

export default async function KompetenzenPage() {
  const content = await getContent();
  return (
    <>
      {/* ----------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-[#0f2742]">
        <div className="absolute inset-0 opacity-20">
          <ProductIllustration category="schrumpfschlauch" fit="cover" className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2742] via-[#0f2742]/90 to-[#0f2742]/60" />
        <div className="container relative py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Kompetenzen</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {c(content, "kompetenzen.hero.title", "Mehr als Standardware – unsere Kompetenzen")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {c(
              content,
              "kompetenzen.hero.intro",
              "Konfektion, Bedruckung, Sonderwerkstoffe und zugelassene Qualität: Über sechs Produktionsstrecken fertigen wir Schrumpf- und Isolierschläuche exakt nach Ihren Vorgaben – vom einzelnen Zuschnitt bis zur Serie.",
            )}
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- Competences */}
      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COMPETENCES.map(({ id, icon: Icon, title, image, imageAlt, text }, i) => (
            <Reveal key={id} delay={i * 70} className="h-full">
              <article className="bit-card flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={imageAlt} className="bit-card-img h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {c(content, "kompetenzen.cta.title", "Sie wünschen ein individuelles Angebot?")}
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              {c(
                content,
                "kompetenzen.cta.text",
                `Teilen Sie uns Ihre Anforderungen mit – ob Zuschnitt, Bedruckung oder Sonderwerkstoff. Rufen Sie uns an (${COMPANY.phone}), schreiben Sie eine E-Mail oder nutzen Sie unser Kontaktformular.`,
              )}
            </p>
          </div>
          <Link
            href="/bit/kontakt"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1e4a7a] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Angebot anfragen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
