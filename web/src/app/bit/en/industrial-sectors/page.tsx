import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { COMPANY } from "../../_data/catalog";
import { Reveal } from "../../_components/reveal";

/** Englische Branchenseite – gleicher Aufbau wie /bit/branchen. */

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/industrial-sectors" },
  title: "Industrial Sectors",
  description:
    "BIT tubing, conduits & cable ties in use: automotive, power engineering, household appliances, medical technology, mechanical, lighting & safety engineering.",
};

interface Industry {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  focus: string;
  image: string;
  text: string[];
}

const INDUSTRIES: Industry[] = [
  {
    id: "power",
    slug: "power-engineering-and-energy-management",
    name: "Power Engineering and Energy Management",
    tagline: "Shrink and insulating products for electrical engineering and renewable energy applications",
    focus: "Electrical insulation, thermal protection, abrasion and rattle protection",
    image: "/bit/branchen/energietechnik.jpg",
    text: [
      "In the fast-growing renewable energy sector, reliable and long-lasting materials are essential. BIT stands out with its high-quality heat-shrink and insulating tubing.",
      "Particularly in demand are high-temperature-resistant heat-shrink tubes made of polyolefin, silicone, PTFE and FEP as well as UV-resistant materials such as Kynar® (PVDF), PVC and polyolefin – ideal for solar energy, wind power and other energy applications.",
    ],
  },
  {
    id: "automotive",
    slug: "automotive",
    name: "Automotive",
    tagline: "Protective sleeves, corrugated conduit pipes, shrinkable tubing, plus solutions for marking and identification",
    focus: "Cable bundling, cable protection, cable marking",
    image: "/bit/branchen/automotive.jpg",
    text: [
      "Since 1996, BIT has been known in the automotive industry for products that meet the highest quality standards – whether heat-shrink tubing, cable protection sleeves or braided sleeves.",
      "Our customers can count on tailor-made solutions perfectly matched to their needs. We offer complete system solutions as well as individual custom products – the long-standing loyalty of international automotive suppliers confirms our approach.",
    ],
  },
  {
    id: "household",
    slug: "home-and-household-appliances",
    name: "Home and Household Appliances",
    tagline: "High-quality cable protection for the home-appliance industry",
    focus: "Cable ties, cable fastening and cable marking solutions",
    image: "/bit/branchen/hausgeraete.jpg",
    text: [
      "The household appliance sector, with its wide range of applications and heterogeneous requirements, constantly presents us with new challenges.",
      "BIT offers individual, tailor-made solutions for your company and supplies high-quality products in accordance with international standards and specifications (including UL 224 VW-1, UL 1441, DIN 40628, DIN 40621).",
    ],
  },
  {
    id: "medical",
    slug: "medical-technology-and-engineering",
    name: "Medical Technology and Engineering",
    tagline: "Biocompatible synthetic products for demanding medtech applications",
    focus: "Certified tubing for medical technology",
    image: "/bit/branchen/medizintechnik.jpg",
    text: [
      "Medical technology places the highest demands on the quality and reliability of the products used.",
      "BIT has an extensive international partner network and can offer your company first-class, individual solutions and certified products.",
    ],
  },
  {
    id: "mechanical",
    slug: "mechanical-and-plant-engineering",
    name: "Mechanical and Plant Engineering",
    tagline: "Corrugated conduit pipes, insulating tubing, protective and expandable braided sleeves for heavy equipment and machine construction",
    focus: "Robust solutions for mechanical and plant engineering",
    image: "/bit/branchen/maschinenbau.jpg",
    text: [
      "Solutions for cable protection, cable bundling and marking for mechanical and plant engineering have been among our core competences since our beginnings.",
      "Where high thermal or chemical resistance, abrasion resistance or very large bundling ranges are required, we recommend a wide range of our standard products – or manufacture individual custom solutions for your application.",
    ],
  },
  {
    id: "lighting",
    slug: "lighting-and-illumination",
    name: "Lighting and Illumination",
    tagline: "Optimal solutions for fastening and protection, marking and identification",
    focus: "Robust cable protection and delicate marking",
    image: "/bit/branchen/licht.jpg",
    text: [
      "We know our way around protective and heat-shrink tubing for lighting and illumination technology. Whether for industrial luminaires, architectural lighting, room lighting, exhibition stands or illuminations – we have suitable products for many applications.",
      "Requirements range from robust cable protection to the delicate, halogen-free marking of individual wires.",
    ],
  },
  {
    id: "safety",
    slug: "safety-equipment-and-engineering",
    name: "Safety Equipment and Engineering",
    tagline: "BIT parts and products for maximum safety",
    focus: "A safe hold with BIT heat-shrink tubing",
    image: "/bit/branchen/sicherheit.jpg",
    text: [
      "In safety engineering in particular, the demands on the quality and reliability of the products used are especially high. BIT is at your side with competent advice.",
      "Particularly in demand are our medium-wall and thick-wall heat-shrink tubes (adhesive-lined on request), which ensure a secure hold on a wide variety of surfaces – for example on wire, fibre and synthetic ropes, load securing, hoists or PPE equipment.",
    ],
  },
];

export default function IndustrialSectorsPage() {
  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">Industrial Sectors</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Industries that trust BIT
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {COMPANY.shortName} has been a reliable partner in a wide range of industries since{" "}
            {COMPANY.foundedYear}. With heat-shrink, insulating, fiberglass and braided sleeves,
            corrugated conduits and cable ties as well as the technical expertise of our staff, we
            develop individual solutions for your requirements.
          </p>
        </div>
      </section>

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
                  alt={ind.name}
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
                  href="/bit/en/products"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
                >
                  View matching products
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="border-t border-slate-200 bg-[#0f2742] py-16">
        <div className="container flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Your industry is not listed?</h2>
            <p className="mt-2 max-w-xl text-slate-300">
              Need advice on choosing the right product? Get in touch with us – via chat, email or
              phone.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Link
              href="/bit/en/contact"
              className="rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
            >
              Request advice
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
