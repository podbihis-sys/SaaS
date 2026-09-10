import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Clock,
  Factory,
  Headset,
  Layers,
  PencilRuler,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CATEGORIES, COMPANY, PRODUCTS } from "../_data/catalog";
import { CATEGORY_IMAGE } from "../_data/catalog";
import { EN_CATEGORY_LABELS, EN_PRODUCTS } from "../_data/catalog-en";
import { ProductCard } from "../_components/product-card";
import { ProductIllustration } from "../_components/product-illustration";
import { HeroSlider, type HeroSlide } from "../_components/hero-slider";
import { Reveal } from "../_components/reveal";
import type { Metadata } from "next";

/**
 * Englische Startseite – gleicher Aufbau wie die deutsche Startseite,
 * Texte aus dem englischen Original (bit-gmbh.de/en) bzw. 1:1 übersetzt.
 */

export const metadata: Metadata = {
  title: { absolute: "BIT – Heat-shrink & insulating tubing technology" },
  description:
    "Halogen-free heat-shrink, insulating and braided sleeves, corrugated conduits and cable ties. 1,000+ articles, delivery within 24 h, cutting and printing.",
  alternates: { canonical: "/bit/en" },
};

const HERO_TRUST = [
  { icon: Headset, title: "Technical advice", text: "Personal, competent and solution-oriented." },
  { icon: Truck, title: "Fast delivery", text: "Standard articles usually within 24 h." },
  { icon: PencilRuler, title: "Custom cutting & printing", text: "Cut and printed to your specification." },
  { icon: ShieldCheck, title: "Certified quality", text: "DIN EN ISO 9001 since 1997." },
];

const COMPETENCES = [
  {
    title: "Tubing cut to length",
    image: "/bit/kompetenzen/abschnitte.jpg",
    href: "/bit/en/service",
  },
  {
    title: "Heat shrink tubing printed",
    image: "/bit/kompetenzen/bedruckt.jpg",
    href: "/bit/en/heat-shrink-tubing-printed",
  },
  {
    title: "Coloured heat shrink tubing",
    image: "/bit/kompetenzen/farbig.jpg",
    href: "/bit/en/coloured-heat-shrink-tubing",
  },
];

const STATS = [
  { icon: Boxes, value: "1,000+", label: "standard articles" },
  { icon: Clock, value: "24 h", label: "delivery of standard articles" },
  { icon: Factory, value: "6", label: "production lines" },
  { icon: BadgeCheck, value: "1996", label: "founded" },
];

const ADVANTAGES = [
  { icon: Truck, title: "Delivery within 24 h", text: "Comprehensive stock-keeping and customer-oriented logistics for standard articles." },
  { icon: PencilRuler, title: "Cutting and printing", text: "Cutting, marking and kits made exactly to your drawing." },
  { icon: Layers, title: "Wide range of materials", text: "Polyolefin, PVC, PTFE, silicone, fiberglass, PVDF and more – for every requirement." },
  { icon: ShieldCheck, title: "Certified quality", text: "Certified according to DIN EN ISO 9001 since 1997 – documented and traceable." },
];

/** Kategorie-Kurzbeschreibungen 1:1 von bit-gmbh.de/en (Abschnitt OUR PRODUCTS). */
const EN_CATEGORY_TEXT: Record<string, string> = {
  schrumpfschlauch:
    "Heatshrink tubing made of polyolefin, PVC, PET, Kynar® (PVDF), PTFE, FEP, elastomer and silicone.",
  isolierschlauch:
    "Insulating tubing made of polyamide, polyethylene, polyurethane, PTFE, PVC, silicone and Viton®.",
  glasseidenschlauch:
    "Fiberglass sleeves coated with polyurethane varnish, acrylic polyurethane resin or silicone.",
  geflechtschlauch:
    "Expandable braided sleeves made of either polyamide, polyester or polypropylene.",
  wellrohr:
    "Corrugated conduit tubing made of polyamide, polypropylene or thermoplastic elastomer (TPE).",
  kabelbinder: "Cable ties and other types of fastening material.",
  verarbeitungsgeraete:
    "Tools for working with or installing other BIT parts like cable-tie tension or heat guns.",
  "weitere-schrumpfprodukte":
    "Shrinkable end caps, breakout boots and other shrink products.",
  "weitere-produkte":
    "Spiral-wrap sleeves, protective rubber sleeves, butt and crimp connectors, and more.",
};

const SECTORS = [
  { label: "Power Engineering and Energy Management", slug: "power-engineering-and-energy-management" },
  { label: "Automotive", slug: "automotive" },
  { label: "Home and Household Appliances", slug: "home-and-household-appliances" },
  { label: "Medical Technology and Engineering", slug: "medical-technology-and-engineering" },
  { label: "Mechanical and Plant Engineering", slug: "mechanical-and-plant-engineering" },
  { label: "Lighting and Illumination", slug: "lighting-and-illumination" },
  { label: "Safety Equipment and Engineering", slug: "safety-equipment-and-engineering" },
];

export default function EnglishHome() {
  const featured = PRODUCTS.filter((p) =>
    [
      "schrumpfschlauch-mit-kleber-bpdw-100",
      "geflechtschlauch-bis-ge-pp",
      "kabelbinder-uv-bestaendig",
    ].includes(p.slug),
  );

  // Hero-Diashow: ein Bild je Produktkategorie plus die Kompetenzen-Bilder
  // (Kundenvorgabe), jeweils klickbar zum Ziel.
  const HERO_SLIDES: HeroSlide[] = [
    ...CATEGORIES.flatMap((cat) => {
      const src = CATEGORY_IMAGE[cat.id];
      const label = EN_CATEGORY_LABELS[cat.id] ?? cat.name;
      return src ? [{ src, alt: label, href: `/bit/en/products/${cat.id}`, label }] : [];
    }),
    ...COMPETENCES.map((k) => ({
      src: k.image,
      alt: k.title,
      href: k.href,
      label: k.title,
    })),
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="bit-hero-glow" />
        <div className="absolute inset-0 bit-grid-light" />
        <div className="container relative grid items-center gap-12 pb-4 pt-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:pb-5 lg:pt-5">
          <div>
            <Reveal
              as="span"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1e4a7a]/10 px-3 py-1 text-xs font-medium text-[#1e4a7a] ring-1 ring-[#1e4a7a]/15"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-[#1e4a7a]" />
              DIN EN ISO 9001 certified since 1997
            </Reveal>
            <Reveal
              as="h1"
              delay={90}
              className="mt-5 text-[1.9rem] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.35rem] xl:text-[2.75rem]"
            >
              Heat-shrink tubing, insulating tubing & cable protection from a single source
            </Reveal>
            <Reveal as="p" delay={170} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Since {COMPANY.foundedYear} we have been supplying automotive, electronics, machine
              building and medical technology with more than 1,000 standard articles – plus custom
              cutting and printing. Standard articles are usually delivered within 24 hours.
            </Reveal>
            <Reveal delay={250} className="mt-9 flex flex-wrap gap-3">
              <Link href="/bit/en/products" className="bit-btn bit-btn-dark">
                <span>Browse products</span>
                <ArrowRight className="bit-arrow h-4 w-4" />
              </Link>
              <Link href="/bit/en/contact" className="bit-btn bit-btn-outline">
                <span>Request advice</span>
              </Link>
            </Reveal>
          </div>

          {/* Wechselndes Hero-Bild (Slider) */}
          <Reveal delay={220} className="relative hidden lg:block">
            {HERO_SLIDES.length > 0 ? (
              <HeroSlider slides={HERO_SLIDES} />
            ) : (
              <div className="relative mx-auto max-w-md">
                <ProductIllustration
                  category="geflechtschlauch"
                  fit="cover"
                  className="aspect-square w-full rounded-[1.75rem]"
                />
              </div>
            )}
          </Reveal>
        </div>

        {/* Trust row */}
        <div className="relative border-t border-slate-200 bg-white/60">
          <div className="container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {HERO_TRUST.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 70} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{title}</div>
                  <div className="text-xs text-slate-500">{text}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Kategorie-Laufschrift */}
        <nav className="relative border-t border-slate-200 py-4" aria-label="Categories at a glance">
          <div className="bit-marquee">
            <div className="bit-marquee__track text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              {[...CATEGORIES, ...CATEGORIES].map((c, i) => {
                const duplicate = i >= CATEGORIES.length;
                return (
                  <Link
                    key={i}
                    href={`/bit/en/products/${c.id}`}
                    tabIndex={duplicate ? -1 : undefined}
                    aria-hidden={duplicate || undefined}
                    className="flex items-center gap-3 whitespace-nowrap rounded-lg px-2 py-1.5 transition-colors hover:bg-[#1e4a7a]/5 hover:text-[#1e4a7a]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" aria-hidden="true" />
                    {EN_CATEGORY_LABELS[c.id] ?? c.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Stat strip */}
        <div className="relative border-t border-slate-200 bg-slate-50">
          <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <Reveal key={label} delay={i * 80} className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                  <Icon className="h-6 w-6 text-[#1e4a7a]" />
                </span>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Categories */}
      <section className="container py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Parts and products</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our products
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 70} className="h-full">
              <Link
                href={`/bit/en/products/${cat.id}`}
                className="bit-card group flex h-full flex-col overflow-hidden"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-t-[1.3rem] bg-gradient-to-br from-slate-50 to-slate-100">
                  <ProductIllustration
                    category={cat.id}
                    fit="cover"
                    className="bit-card-img h-full w-full"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-lg font-semibold text-slate-900">
                    {EN_CATEGORY_LABELS[cat.id] ?? cat.name}
                  </p>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {EN_CATEGORY_TEXT[cat.id] ?? ""}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                    View products
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Advantages */}
      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="container">
          <Reveal as="h2" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why BIT
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80} className="h-full">
                <div className="bit-card flex h-full flex-col p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e4a7a] to-[#163a61] text-white shadow-lg shadow-[#1e4a7a]/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-4 font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Competences */}
      <section className="container py-20 sm:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Competences</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              We manufacture to your specification
            </h2>
            <p className="mt-3 text-slate-600">
              Cutting, printing, special materials and certified quality – on six production lines
              we cut and print exactly to your specification.
            </p>
          </div>
          <Link
            href="/bit/en/service"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
          >
            Our service
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMPETENCES.map((k, i) => (
            <Reveal key={k.title} delay={i * 70} className="h-full">
              <Link href={k.href} className="bit-card group flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={k.image} alt={k.title} className="bit-card-img h-full w-full object-contain" loading="lazy" />
                </div>
                <div className="flex flex-1 items-center justify-between gap-2 p-5">
                  <p className="font-semibold text-slate-900">{k.title}</p>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#1e4a7a] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- Featured */}
      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="container">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Popular articles
              </h2>
            </div>
            <Link
              href="/bit/en/products"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
            >
              All products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                locale="en"
                href={`/bit/en/products/${p.category}/${p.slug}`}
                nameOverride={EN_PRODUCTS[p.slug]?.name}
                categoryLabel={EN_CATEGORY_LABELS[p.category]}
              />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- Industries */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="container text-center">
          <Reveal as="h2" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Industrial sectors that trust us
          </Reveal>
          <Reveal as="p" delay={80} className="mx-auto mt-3 max-w-2xl text-slate-600">
            From wiring harnesses to medical technology – our tubing and fastening solutions are
            used wherever reliability matters.
          </Reveal>
        </div>
        <div className="bit-marquee mt-10">
          <div className="bit-marquee__track">
            {[...SECTORS, ...SECTORS].map((sector, i) => {
              const duplicate = i >= SECTORS.length;
              return (
                <Link
                  key={i}
                  href={`/bit/en/industrial-sectors/${sector.slug}`}
                  tabIndex={duplicate ? -1 : undefined}
                  aria-hidden={duplicate || undefined}
                  className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-medium text-slate-700 shadow-sm transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
                >
                  {sector.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="container mt-10 text-center">
          <Link
            href="/bit/en/industrial-sectors"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#1e4a7a] hover:border-[#1e4a7a]"
          >
            Explore industry solutions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------ Range overview */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container">
          <Reveal as="h2" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Our product range at a glance
          </Reveal>
          <Reveal as="div" delay={60} className="mt-4 grid gap-4 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
            <p>
              <strong className="text-slate-900">Heat-shrink tubing</strong> in every variant: as
              required by the intended application, we supply shrinkable tubing made from various
              types of plastic and synthetic material with a number of special properties –
              including types with adhesive lining, high-temperature types made of PTFE, FEP and
              Kynar® (PVDF), UL-approved, coloured and printed heat-shrink tubing.
            </p>
            <p>
              <strong className="text-slate-900">Insulating & silicone tubing</strong>,
              <strong className="text-slate-900"> fiberglass sleeving</strong> and
              <strong className="text-slate-900"> expandable braided sleeves</strong> made of
              polyamide, polyester or aramid for cable protection, insulation and bundling.
            </p>
            <p>
              <strong className="text-slate-900">Corrugated conduits</strong> slit and unslit made
              of PP, PA, PFA and TPE – plus two-part conduits for retrofitting.
            </p>
            <p>
              <strong className="text-slate-900">Cable ties & tools</strong>: standard, stainless
              steel, UV-resistant and reusable cable ties, plus tension tools, heat guns and shrink
              ovens. Including custom cutting, printing and kits.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-6 flex flex-wrap gap-3">
            <Link href="/bit/en/products" className="bit-btn bit-btn-dark">
              <span>View all products</span>
              <ArrowRight className="bit-arrow h-4 w-4" />
            </Link>
            <Link href="/bit/en/service" className="bit-btn bit-btn-outline">
              <span>Cutting & printing service</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="container py-20 sm:py-24">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-[#0f2742] px-8 py-16 text-center text-white sm:px-16">
          <div className="bit-aurora" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Put together your inquiry
            </h2>
            <p className="mx-auto mt-4 text-slate-300">
              Add the required articles in all needed sizes to the cart and send everything in a
              single request for quotation. We will get back to you with an individual quote –
              usually within 24 hours.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/bit/en/products" className="bit-btn bit-btn-primary">
                <span>Browse products</span>
                <ArrowRight className="bit-arrow h-4 w-4" />
              </Link>
              <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="bit-btn bit-btn-ghost">
                <Phone className="h-4 w-4" />
                <span>{COMPANY.phone}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
