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
import { COMPANY } from "../../_data/catalog";
import { Reveal } from "../../_components/reveal";

/** Englische Kompetenzen-Seite – gleicher Aufbau wie /bit/kompetenzen. */

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/competences" },
  title: "Competences",
  description:
    "Cutting to length, printing, special materials, UL approval, coloured heat-shrink tubing and a wide range of sizes – the competences of BIT.",
};

const COMPETENCES = [
  {
    id: "abschnitte",
    icon: Scissors,
    title: "Cutting to length & heat-shrink tubing sections",
    image: "/bit/kompetenzen/abschnitte.jpg",
    imageAlt: "Heat-shrink tubing sections from our own production",
    text: "We cut and process heat-shrink, insulating and fiberglass sleeves to your specification – with tight length tolerances, high cutting accuracy and short lead times. Tubing below 1 mm diameter is cut to special lengths from 3 mm. Realised on six production lines at our site in Heimerzheim.",
    href: "/bit/en/service",
  },
  {
    id: "bedruckt",
    icon: Printer,
    title: "Printing to your requirements",
    image: "/bit/kompetenzen/bedruckt.jpg",
    imageAlt: "Printed heat-shrink tubing sections",
    text: "Company logo, brand name, barcode or consecutive serial numbers – we print heat-shrink and insulating tubing to your requirements. Printing is done on black or coloured tubing in various ink colours.",
    href: "/bit/en/heat-shrink-tubing-printed",
  },
  {
    id: "ptfe",
    icon: FlaskConical,
    title: "Special materials PTFE, FEP & Kynar (PVDF)",
    image: "/bit/kompetenzen/ptfe.jpg",
    imageAlt: "Heat-shrink tubing made of PTFE, FEP and Kynar",
    text: "Our special heat-shrink tubing made of PTFE, FEP and Kynar (PVDF) offers excellent protection in the most demanding environments: extremely temperature-resistant, chemically resistant and electrically insulating – ideal for aviation, medical technology, high-voltage engineering and industrial electronics.",
    href: "/bit/en/products/schrumpfschlauch",
  },
  {
    id: "ul",
    icon: BadgeCheck,
    title: "Tubing with UL approval",
    image: "/bit/kompetenzen/ul.jpg",
    imageAlt: "Heat-shrink and insulating tubing with UL 224 approval",
    text: "For many of our heat-shrink and insulating tubes we confirm approval according to UL 224. The listed types fall under UL listing YDPU2.E196690 – we provide the relevant certificates on request.",
    href: "/bit/en/products/schrumpfschlauch",
  },
  {
    id: "farbig",
    icon: Palette,
    title: "Coloured heat-shrink tubing",
    image: "/bit/kompetenzen/farbig.jpg",
    imageAlt: "Coloured heat-shrink tubing for marking",
    text: "Besides black, we stock many heat-shrink tubing types in numerous colours – ideal for colour-coding cables and wires. On request we produce BP 125 and BP 300 to your specification based on RAL or Pantone shades.",
    href: "/bit/en/coloured-heat-shrink-tubing",
  },
  {
    id: "abmessungen",
    icon: Ruler,
    title: "Wide range of sizes",
    image: "/bit/kompetenzen/abmessungen.jpg",
    imageAlt: "Heat-shrink tubing in many sizes",
    text: "From thin-wall to thick-wall: our heat-shrink tubing covers a broad spectrum of diameters and shrink ratios. Further special sizes and processing to your specification are possible at any time.",
    href: "/bit/en/products/schrumpfschlauch",
  },
];

export default function CompetencesPage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Competences</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            More than standard parts – our competences
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Cutting, printing, special materials and certified quality: on six production lines we
            manufacture heat-shrink and insulating tubing exactly to your specification – from a
            single cut to series production.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COMPETENCES.map(({ id, icon: Icon, title, image, imageAlt, text, href }, i) => (
            <Reveal key={id} delay={i * 70} className="h-full">
              <Link href={href} className="bit-card group flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={imageAlt} className="bit-card-img h-full w-full object-contain" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-[#1e4a7a]">{title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Would you like an individual quote?
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Tell us your requirements – cutting, printing or special material. Call us
              ({COMPANY.phone}), send an email or use our contact form.
            </p>
          </div>
          <Link
            href="/bit/en/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1e4a7a] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Request a quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
