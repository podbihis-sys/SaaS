import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  Headset,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { COMPANY } from "../_data/catalog";
import { BreadcrumbLd } from "../_components/breadcrumb-ld";
import { Reveal } from "../_components/reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/service" },
  title: "Service",
  description:
    "Beratung, Logistik, Konfektion und Qualitätsmanagement: der Service der BIT – Standardartikel in der Regel innerhalb von 24 Stunden.",
};

/**
 * Service-Seite – komplett überarbeitetes Layout (Kundenvorgabe) statt der
 * generischen Import-Ansicht. Inhalte von bit-gmbh.de/service/.
 */
const PILLARS = [
  {
    icon: Headset,
    image: "/bit/pages/service-35.jpg",
    title: "Beratung",
    points: [
      "Technisch qualifizierte Beratung für Ihr individuelles Anliegen",
      "Problemlösung vor Ort",
      "Feste Ansprechpartner",
    ],
    text: "Die professionelle Beratung unserer Kunden ist für uns nicht nur eine Verpflichtung, sondern wesentlicher Bestandteil unseres täglichen Denkens und Handelns. Mit unserem kompetenten und engagierten Team stehen wir Ihnen zur Seite, wenn es darum geht, die optimalen Produktlösungen für Ihre Anwendung zu finden.",
  },
  {
    icon: Truck,
    image: "/bit/pages/service-36.jpg",
    title: "Logistik",
    points: [
      "Hohe Lagerkapazität",
      "Sofort- und Termin-Bestellungen",
      "Just-in-Time-Produktion",
    ],
    text: "Schnelligkeit und Zuverlässigkeit zählt! Die BIT betreibt eine umfassende Lagerhaltung und bietet eine kundenorientierte Logistik: In der Regel erhalten Sie unsere Standardartikel innerhalb von 24 Stunden.",
  },
  {
    icon: Wrench,
    image: "/bit/pages/service-37.jpg",
    title: "Konfektion & Service",
    points: [
      "Bedrucken, Ablängen, Perforieren",
      "Individuelle Verpackungseinheiten, eigene Verpackungen und Etiketten",
      "Direktversand an Ihre Kunden",
    ],
    text: "Die Konfektionierung unserer Schrumpf- und Isolierschläuche realisieren wir über sechs Produktionsstrecken. Gerne schneiden wir nach Ihren Vorgaben zu; Geflechtschläuche werden auf Wunsch thermisch abgelängt.",
  },
  {
    icon: ShieldCheck,
    image: "/bit/pages/service-38.jpg",
    title: "Qualitätsmanagement",
    points: [
      "Laufende Kontrollen in Wareneingang, Produktion und Warenausgang",
      "Messprotokolle und Werksprüfzeugnisse",
      "Schrumpfofen sowie Messmittel für Wandstärke, Durchmesser und Länge",
    ],
    text: "Der Qualität unserer Produkte und Services verpflichtet, stellen wir uns regelmäßig der Zertifizierung nach DIN EN ISO 9001. Der TÜV bestätigte unser Qualitätsmanagement erstmals im Jahr 1997 – zuletzt im Juli 2025 ohne Beanstandung.",
  },
  {
    icon: BadgeCheck,
    image: "/bit/pages/service-39.jpg",
    title: "Zertifizierung",
    points: [
      "DIN EN ISO 9001:2015",
      "UL File E196690 und UL File E362210",
      "Alle Produkte REACH- und RoHS-konform",
    ],
    text: "Für unsere Kunden bedeutet das ein Höchstmaß an Transparenz, Sicherheit, Effizienz und Service – dokumentiert und rückverfolgbar.",
  },
];

export default function ServicePage() {
  return (
    <>
      <BreadcrumbLd
        items={[
          { name: "Home", path: "/bit" },
          { name: "Die BIT", path: "/bit/unternehmen" },
          { name: "Service", path: "/bit/service" },
        ]}
      />

      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Die BIT</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Service
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
            „Wer aufhört besser zu werden, hat aufgehört gut zu sein.“ Höchste Qualität, kürzeste
            Reaktionszeiten, größte Zuverlässigkeit und ein umfassender Service zeichnen die{" "}
            {COMPANY.legalName} seit fast 30 Jahren aus.
          </p>
        </div>
      </section>

      {/* Fünf Service-Säulen */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Ihre Vorteile auf einen Blick
        </h2>
        <div className="mt-10 space-y-10">
          {PILLARS.map(({ icon: Icon, image, title, points, text }, i) => (
            <Reveal key={title} delay={0}>
              <article
                className={`grid items-center gap-8 rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 ${
                  i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="overflow-hidden rounded-2xl bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={title}
                    className="aspect-[16/10] w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38bdf8]" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Downloads + Kontakt */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
              <Download className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Downloads</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Datenblätter zu allen Produkten, unser Lieferprogramm, Zertifikate und
              Lieferantenerklärungen finden Sie im Download-Bereich.
            </p>
            <Link
              href="/bit/service/downloads"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
            >
              Zu den Downloads <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
              <Headset className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Konfektionierung nach Wunsch?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sprechen Sie unseren Vertrieb an – ob Zuschnitt, Bedruckung, spezielle
              Verpackungseinheiten oder Direktversand an Ihre Kunden.
            </p>
            <Link
              href="/bit/kontakt"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
            >
              Kontakt aufnehmen <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
