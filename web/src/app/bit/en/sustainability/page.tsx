import type { Metadata } from "next";
import Link from "next/link";
import {
  Car,
  GraduationCap,
  Heart,
  Leaf,
  MapPin,
  Package,
  Recycle,
  ShieldCheck,
  Sun,
  Timer,
  Zap,
} from "lucide-react";

/** Englische Nachhaltigkeits-Seite – gleicher Aufbau wie /bit/nachhaltigkeit. */

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/sustainability" },
  title: "Sustainability",
  description:
    "Sustainability at BIT: long-lasting products, RoHS & REACH compliance, regional responsibility and training at our site in Swisttal-Heimerzheim.",
};

const PILLARS = [
  {
    icon: Zap,
    title: "We rely on green electricity",
    text: "Administration, warehouse and production at our Swisttal-Heimerzheim site run on electricity from renewable sources.",
  },
  {
    icon: Sun,
    title: "Our own photovoltaic system",
    text: "The PV system on our company roof generates a large share of our electricity – making BIT largely energy self-sufficient.",
  },
  {
    icon: Car,
    title: "Electric vehicle fleet",
    text: "Our fleet is electric and charges directly on site – with solar power from our own roof.",
  },
  {
    icon: Timer,
    title: "Long-lasting products",
    text: "Heat-shrink and insulating tubing protects cables and connections for decades – resistance to temperature, chemicals and UV extends the service life of entire assemblies and avoids premature replacement.",
  },
  {
    icon: ShieldCheck,
    title: "RoHS & REACH",
    text: "Our standard articles comply with the applicable environmental and substance restriction directives. Halogen-free materials reduce corrosive and toxic gases in case of fire.",
  },
  {
    icon: Package,
    title: "Processing to demand",
    text: "Cutting and printing to demand means you purchase exactly the quantity you need. This reduces offcuts and stock waste – at your end and at ours.",
  },
  {
    icon: Recycle,
    title: "Resource-saving processes",
    text: "Short distances between warehouse, production and dispatch at one site, reused packaging and consolidated shipments save material and transport kilometres.",
  },
  {
    icon: MapPin,
    title: "Regional responsibility",
    text: "As a family business we have been rooted in Swisttal-Heimerzheim since 1996 – with jobs, internships and orders for the region.",
  },
  {
    icon: GraduationCap,
    title: "Training & employees",
    text: "A training company since our foundation: we invest in young talent, further training and workplace health promotion – sustainability starts with the team.",
  },
];

const SOCIAL = [
  "Swisttaler Tafel e.V.",
  "Aktion Lichtblicke e.V.",
  "SOS-Kinderdorf e.V.",
  "Arbeiter-Samariter-Bund Deutschland e.V.",
  "Stiftung Deutsche KinderKrebshilfe",
];

export default function SustainabilityPage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">
            <Leaf className="h-4 w-4" /> Sustainability
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white">
            Responsibility for product, region and team
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            For us, sustainability is not a label but everyday practice: long-lasting products,
            compliant materials, processing to demand and reliable cooperation – at our site in
            Swisttal-Heimerzheim and beyond.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#38bdf8]/15 text-[#1d4ed8]">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="container grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">
              Social commitment
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              We give something back
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Social commitment is a central element of BIT&apos;s corporate culture. We have been
              supporting non-profit organisations for years – in 2021 we also donated to those
              affected by the flood disaster in Rhineland-Palatinate and North Rhine-Westphalia.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {SOCIAL.map((org) => (
                <li key={org} className="flex items-center gap-2 text-sm text-slate-700">
                  <Heart className="h-4 w-4 shrink-0 text-[#38bdf8]" /> {org}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
              Quality & certificates
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Documented, not just claimed
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Our quality management has been certified according to DIN EN ISO 9001 since 1997.
              We are happy to provide RoHS and REACH declarations of conformity as well as
              technical data sheets on request.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bit/en/about-bit"
                className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
              >
                About BIT
              </Link>
              <Link
                href="/bit/en/contact"
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Request certificates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
