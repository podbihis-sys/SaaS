import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Factory, Heart, History, Target, Users } from "lucide-react";
import { COMPANY } from "../../_data/catalog";

/** Englische Unternehmensseite – gleicher Aufbau wie /bit/die-bit. */

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/about-bit" },
  title: "About BIT",
  description:
    "BIT – since 1996 a specialised manufacturer and supplier of heat-shrink, insulating and braided sleeves from Swisttal-Heimerzheim.",
};

// Meilensteine – aus der englischen Firmengeschichte (bit-gmbh.de/en/about-bit).
const milestones = [
  { year: "1996", text: "BIT is founded – with an admittedly idiosyncratic start in a humble pair of office trailers." },
  { year: "1997 & 2000", text: "Certification according to DIN EN ISO 9001 by the German TÜV for outstanding quality management." },
  { year: "2001", text: "Move to a new office and production facility with much more space for storage and production." },
  { year: "2007", text: "Opening of a second central warehouse – the beginning of a new phase of commercial growth." },
  { year: "2013", text: "More than 17 years of experience, an expertly honed product portfolio and superior customer service." },
  { year: "2016", text: "BIT looks back on a 20-year success story – a company with global reach and 25 employees." },
  { year: "2019", text: "Recertification by TÜV Rheinland according to DIN EN ISO 9001 – passed with flying colours." },
  { year: "2021", text: "25 successful years of company history – an epitome for quality, reliability and customer service." },
  { year: "Today", text: "30th anniversary: more than 1,000 standard articles and customer-specific solutions – used worldwide from the automotive industry to the medtech sector." },
];

const SECTORS = [
  { label: "Automotive", slug: "automotive" },
  { label: "Power Engineering and Energy Management", slug: "power-engineering-and-energy-management" },
  { label: "Home and Household Appliances", slug: "home-and-household-appliances" },
  { label: "Medical Technology and Engineering", slug: "medical-technology-and-engineering" },
  { label: "Mechanical and Plant Engineering", slug: "mechanical-and-plant-engineering" },
  { label: "Lighting and Illumination", slug: "lighting-and-illumination" },
  { label: "Safety Equipment and Engineering", slug: "safety-equipment-and-engineering" },
];

export default function AboutBitPage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Company</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            About BIT
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Since {COMPANY.foundedYear}, {COMPANY.shortName} from {COMPANY.city} has been a reliable
            partner of renowned companies for heat-shrink tubing, insulating and protective sleeves,
            plastic fastening and cable tie solutions.
          </p>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: History, title: "Experience since 1996", text: "Almost three decades of know-how in materials and processing." },
            { icon: Factory, title: "In-house processing", text: "Six production lines for cutting, printing and processing." },
            { icon: Target, title: "Customer-oriented", text: "Comprehensive stock-keeping, standard articles usually within 24 hours." },
            { icon: Users, title: "Across industries", text: "From automotive to medical technology – advice in partnership." },
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Our development</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-700">
            Much has changed since BIT was founded back in 1996: from its start in a pair of office
            trailers, BIT Bierther GmbH has grown sustainably into a flourishing business – with a
            move to a brand-new warehouse-and-office annex and the setup of custom production lines.
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
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Social commitment</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Responsibility we live by
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Social commitment is a central element of BIT&apos;s corporate culture. We have been
              supporting various non-profit organisations for years – and in 2021 we also donated
              to those affected by the flood disaster in Rhineland-Palatinate and North
              Rhine-Westphalia.
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
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">Career</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Become part of the BIT team
            </h2>
            <p className="mt-4 leading-relaxed text-slate-700">
              Career starter, sales professional or career changer: we are looking for
              personalities who enjoy varied work in a clearly structured, diverse team and who
              value a very good working atmosphere as much as professionalism and service towards
              the customer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bit/en/career"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
              >
                View open positions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Industries & markets</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Our products are used wherever electrical insulation, mechanical protection and reliable
          bundling are required.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {SECTORS.map((s) => (
            <Link
              key={s.slug}
              href={`/bit/en/industrial-sectors/${s.slug}`}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
            >
              {s.label}
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/bit/en/industrial-sectors"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            View all industries <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/bit/en/products"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Browse products
          </Link>
        </div>
      </section>
    </>
  );
}
