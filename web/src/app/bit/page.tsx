import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Clock,
  Factory,
  Layers,
  PencilRuler,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CATEGORIES, COMPANY, INDUSTRIES, PRODUCTS } from "./_data/catalog";
import { ProductCard } from "./_components/product-card";
import { ProductIllustration } from "./_components/product-illustration";
import { Reveal } from "./_components/reveal";

const STATS = [
  { icon: Boxes, value: "1.000+", label: "Standardartikel" },
  { icon: Clock, value: "24 h", label: "Lieferung Standardware" },
  { icon: Factory, value: "6", label: "Produktionslinien" },
  { icon: BadgeCheck, value: "1996", label: "gegründet" },
];

const ADVANTAGES = [
  { icon: Truck, title: "Lieferfähig in 24 h", text: "Umfassende Lagerhaltung und kundenorientierte Logistik für Standardartikel." },
  { icon: PencilRuler, title: "Konfektion ab Losgröße 1", text: "Zuschnitt, Kennzeichnung und Sätze exakt nach Ihrer Zeichnung." },
  { icon: Layers, title: "Werkstoffvielfalt", text: "Polyolefin, PVC, PTFE, Silikon, Glasseide, PVDF und mehr – für jede Anforderung." },
  { icon: ShieldCheck, title: "Geprüfte Qualität", text: "Seit 1997 nach DIN EN ISO 9001 zertifiziert – dokumentiert und rückverfolgbar." },
];

export default function BitHome() {
  const featured = PRODUCTS.filter((p) =>
    [
      "schrumpfschlauch-mit-kleber-bpdw-100",
      "geflechtschlauch-bis-ge-pp",
      "kabelbinder-uv-bestaendig",
    ].includes(p.slug),
  );

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-[#0f2742] text-white">
        <div className="bit-aurora" />
        <div className="absolute inset-0 bit-grid" />
        <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <Reveal
              as="span"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-[#f59e0b]" />
              DIN EN ISO 9001 zertifiziert seit 1997
            </Reveal>
            <Reveal
              as="h1"
              delay={90}
              className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl xl:text-6xl"
            >
              Schrumpf- &amp; Isolier&shy;schlauchtechnik{" "}
              <span className="bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] bg-clip-text text-transparent">
                aus einer Hand
              </span>
            </Reveal>
            <Reveal as="p" delay={170} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Seit {COMPANY.foundedYear} beliefern wir Automotive, Elektronik, Maschinenbau und
              Medizintechnik mit über 1.000 Standardartikeln – plus Konfektion nach Maß.
              Standardware in der Regel innerhalb von 24 Stunden.
            </Reveal>
            <Reveal delay={250} className="mt-9 flex flex-wrap gap-3">
              <Link href="/bit/produkte" className="bit-btn bit-btn-primary">
                <span>Sortiment entdecken</span>
                <ArrowRight className="bit-arrow h-4 w-4" />
              </Link>
              <Link href="/bit/kontakt" className="bit-btn bit-btn-ghost">
                <span>Beratung anfragen</span>
              </Link>
            </Reveal>
          </div>

          {/* Floating product visual */}
          <Reveal delay={220} className="relative hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="bit-spin-slow absolute -right-8 -top-8 h-28 w-28 rounded-full border border-dashed border-[#f59e0b]/40" />
              <div className="bit-float overflow-hidden rounded-[1.75rem] bg-white/5 p-3 shadow-2xl ring-1 ring-white/15 backdrop-blur">
                <ProductIllustration
                  category="geflechtschlauch"
                  fit="cover"
                  className="aspect-square w-full rounded-[1.4rem]"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl">
                <div className="text-xl font-bold text-[#1e4a7a]">1.000+</div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Artikel ab Lager</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Category marquee */}
        <div className="relative border-t border-white/10 py-4">
          <div className="bit-marquee">
            <div className="bit-marquee__track text-sm font-medium uppercase tracking-[0.18em] text-white/45">
              {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
                <span key={i} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative border-t border-white/10 bg-[#0c2138]">
          <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <Reveal key={label} delay={i * 80} className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-[#f59e0b]" />
                </span>
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Categories */}
      <section className="container py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-[#c27803]">Sortiment</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sechs Produktwelten
          </h2>
          <p className="mt-3 text-slate-600">
            Für Isolation, Schutz und Bündelung – jeder Artikel mit allen verfügbaren Größen direkt
            anfragbar.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 70} className="h-full">
              <Link
                href={`/bit/produkte?kategorie=${cat.id}`}
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
                  <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                  <p className="mt-1 text-sm font-medium text-[#c27803]">{cat.tagline}</p>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {cat.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                    Produkte ansehen
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
            Warum BIT Bierther
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80} className="h-full">
                <div className="bit-card flex h-full flex-col p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e4a7a] to-[#163a61] text-white shadow-lg shadow-[#1e4a7a]/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- Featured */}
      <section className="container py-20 sm:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-[#c27803]">Beliebt</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Beliebte Artikel
            </h2>
            <p className="mt-2 text-slate-600">Direkt mit allen Größen in den Warenkorb legen.</p>
          </div>
          <Link
            href="/bit/produkte"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
          >
            Alle Produkte
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </Reveal>
      </section>

      {/* ---------------------------------------------------------- Industries */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container text-center">
          <Reveal as="h2" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Branchen, die uns vertrauen
          </Reveal>
          <Reveal as="p" delay={80} className="mx-auto mt-3 max-w-2xl text-slate-600">
            Vom Bordnetz bis zur Medizintechnik – unsere Schläuche und Befestigungslösungen sind dort
            im Einsatz, wo es auf Zuverlässigkeit ankommt.
          </Reveal>
        </div>
        <div className="bit-marquee mt-10">
          <div className="bit-marquee__track">
            {[...INDUSTRIES, ...INDUSTRIES].map((industry, i) => (
              <span
                key={i}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-medium text-slate-700 shadow-sm"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="container py-20 sm:py-24">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-[#0f2742] px-8 py-16 text-center text-white sm:px-16">
          <div className="bit-aurora" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Stellen Sie Ihre Anfrage zusammen
            </h2>
            <p className="mx-auto mt-4 text-slate-300">
              Legen Sie die gewünschten Artikel in allen benötigten Größen in den Warenkorb und senden
              Sie alles in einer einzigen Anfrage. Wir melden uns mit einem individuellen Angebot – in
              der Regel innerhalb von 24 Stunden.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/bit/produkte" className="bit-btn bit-btn-primary">
                <span>Zum Sortiment</span>
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
