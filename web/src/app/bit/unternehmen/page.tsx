import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, History, Target, Users } from "lucide-react";
import { COMPANY, INDUSTRIES } from "../_data/catalog";
import { ProductIllustration } from "../_components/product-illustration";

export const metadata: Metadata = {
  title: "Unternehmen",
  description:
    "BIT Bierther GmbH – seit 1996 spezialisierter Hersteller und Lieferant für Schrumpf-, Isolier- und Geflechtschläuche aus Swisttal-Heimerzheim.",
};

const milestones = [
  { year: "1996", text: "Gründung der BIT Bierther GmbH als spezialisierter Schlauchlieferant." },
  { year: "1997", text: "Erste Zertifizierung nach DIN EN ISO 9001 durch den TÜV." },
  { year: "2005", text: "Ausbau der Konfektion auf mehrere Produktionslinien." },
  { year: "Heute", text: "Über 1.000 Standardartikel und kundenspezifische Lösungen für ganz Europa." },
];

export default function UnternehmenPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0f2742]">
        <div className="absolute inset-0 opacity-15">
          <ProductIllustration category="konfektion" className="h-full w-full" />
        </div>
        <div className="container relative py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#f59e0b]">Unternehmen</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Spezialist für Schrumpf- & Isolierschlauchtechnik
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Seit {COMPANY.foundedYear} ist die {COMPANY.legalName} aus {COMPANY.city} ein
            verlässlicher Partner renommierter Unternehmen für Schrumpfschläuche, Isolier- und
            Schutzschläuche, Kunststoffbefestigung und Kabelbinderlösungen.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: History, title: "Erfahrung seit 1996", text: "Fast drei Jahrzehnte Know-how in Werkstoffen und Verarbeitung." },
            { icon: Factory, title: "Eigene Konfektion", text: "Sechs Produktionslinien für Zuschnitt, Kennzeichnung und Sätze." },
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

      <section className="container py-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Branchen & Märkte</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Unsere Produkte sind dort im Einsatz, wo elektrische Isolation, mechanischer Schutz und
          zuverlässige Bündelung gefragt sind.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {INDUSTRIES.map((i) => (
            <span key={i} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">
              {i}
            </span>
          ))}
        </div>
        <Link
          href="/bit/produkte"
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#163a61]"
        >
          Sortiment ansehen <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}
