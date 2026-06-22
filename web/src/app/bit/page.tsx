import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarDays,
  Clock,
  Factory,
  Headset,
  Layers,
  PencilRuler,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CATEGORIES, COMPANY, INDUSTRIES, PRODUCTS, getProduct } from "./_data/catalog";
import { c } from "./_data/content";
import { getContent } from "./_data/content-server";
import { getCmsNews } from "./_data/news-server";
import { formatDate } from "./_lib/format";
import { ProductCard } from "./_components/product-card";
import { ProductIllustration } from "./_components/product-illustration";
import { HeroSlider, type HeroSlide } from "./_components/hero-slider";
import { Reveal } from "./_components/reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "BIT Bierther GmbH – Schrumpf- & Isolierschlauchtechnik" },
  description:
    "Halogenfreie Schrumpf-, Isolier- & Geflechtschläuche, Wellrohre & Kabelbinder. 1.000+ Artikel, Lieferung in 24 h, Konfektion ab Losgröße 1.",
  alternates: { canonical: "/bit" },
};

// Wechselnde Hero-Bilder (rechte Seite) aus dem realen Sortiment.
const HERO_SLIDES: HeroSlide[] = [
  "3-1-schrumpfschlauch-bp-300",
  "schrumpfschlauch-bp-135",
  "hart-pvc-schrumpfschlauch",
  "dickwandiger-schrumpfschlauch-bptw",
]
  .map(getProduct)
  .filter((p): p is NonNullable<typeof p> => Boolean(p))
  .map((p) => ({ src: p.image, alt: p.imageAlt }));

const HERO_TRUST = [
  { icon: Headset, title: "Technische Beratung", text: "Persönlich, kompetent und lösungsorientiert." },
  { icon: Truck, title: "Schnelle Lieferung", text: "Standardware in der Regel in 24 h." },
  { icon: PencilRuler, title: "Individuelle Konfektion", text: "Zuschnitt & Sätze ab Losgröße 1." },
  { icon: ShieldCheck, title: "Zertifizierte Qualität", text: "DIN EN ISO 9001 seit 1997." },
];

const KOMPETENZEN = [
  { title: "Schlauch-Abschnitte & Konfektion", image: "/bit/kompetenzen/abschnitte.jpg" },
  { title: "Schrumpfschlauch bedruckt", image: "/bit/kompetenzen/bedruckt.jpg" },
  { title: "Farbige Schrumpfschläuche", image: "/bit/kompetenzen/farbig.jpg" },
];

const FAQ = [
  {
    q: "Was ist ein Schrumpfschlauch und wofür wird er verwendet?",
    a: "Ein Schrumpfschlauch ist ein Kunststoffschlauch, der sich bei Wärme auf einen definierten Durchmesser zusammenzieht. Er wird zur elektrischen Isolation, zur Bündelung und Kennzeichnung von Kabeln sowie zum mechanischen Schutz und zur Abdichtung von Verbindungen eingesetzt.",
  },
  {
    q: "Welche Schrumpfraten bietet die BIT Bierther GmbH an?",
    a: "Wir führen Schrumpfschläuche mit Schrumpfraten von 1,3:1 bis 6:1 – aus Polyolefin, PVC, PTFE, FEP, PVDF (Kynar®), Silikon und Elastomer, dünn- bis dickwandig und optional mit Innenkleber.",
  },
  {
    q: "Wie schnell liefert BIT Bierther?",
    a: "Standardartikel sind in der Regel ab Lager verfügbar und werden meist innerhalb von 24 Stunden versendet. Für Konfektion, Bedruckung und Sonderwerkstoffe nennen wir Ihnen mit dem Angebot einen verbindlichen Liefertermin.",
  },
  {
    q: "Bietet BIT Bierther Konfektion und Bedruckung an?",
    a: "Ja. Über sechs Produktionsstrecken schneiden, bedrucken und konfektionieren wir Schrumpf-, Isolier- und Glasseidenschläuche nach Ihren Vorgaben – vom einzelnen Zuschnitt bis zur Serie.",
  },
  {
    q: "In welchen Branchen werden die Produkte eingesetzt?",
    a: "Unsere Schläuche, Wellrohre und Kabelbinder kommen u. a. in Automotive, Energietechnik, Hausgeräten, Medizintechnik, Maschinen- und Anlagenbau, Licht- und Sicherheitstechnik zum Einsatz.",
  },
];

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

export default async function BitHome() {
  const [content, news] = await Promise.all([getContent(), getCmsNews()]);
  const latestNews = news.slice(0, 3);
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
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="bit-hero-glow" />
        <div className="absolute inset-0 bit-grid-light" />
        <div className="container relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Reveal
              as="span"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1e4a7a]/10 px-3 py-1 text-xs font-medium text-[#1e4a7a] ring-1 ring-[#1e4a7a]/15"
            >
              <BadgeCheck className="h-3.5 w-3.5 text-[#1e4a7a]" />
              {c(content, "home.hero.badge", "DIN EN ISO 9001 zertifiziert seit 1997")}
            </Reveal>
            <Reveal
              as="h1"
              delay={90}
              className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl xl:text-6xl"
            >
              {c(content, "home.hero.title", "Schrumpfschläuche, Isolierschläuche & Kabelschutz aus einer Hand")}
            </Reveal>
            <Reveal as="p" delay={170} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {c(
                content,
                "home.hero.subtitle",
                `Seit ${COMPANY.foundedYear} beliefern wir Automotive, Elektronik, Maschinenbau und Medizintechnik mit über 1.000 Standardartikeln – plus Konfektion nach Maß. Standardware in der Regel innerhalb von 24 Stunden.`,
              )}
            </Reveal>
            <Reveal delay={250} className="mt-9 flex flex-wrap gap-3">
              <Link href="/bit/produkte" className="bit-btn bit-btn-dark">
                <span>Sortiment entdecken</span>
                <ArrowRight className="bit-arrow h-4 w-4" />
              </Link>
              <Link href="/bit/kontakt" className="bit-btn bit-btn-outline">
                <span>Beratung anfragen</span>
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

        {/* Category marquee */}
        <div className="relative border-t border-slate-200 py-4">
          <div className="bit-marquee">
            <div className="bit-marquee__track text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
                <span key={i} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

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
          <span className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Sortiment</span>
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
                href={`/bit/produkte/kategorie/${cat.id}`}
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
                  <p className="text-lg font-semibold text-slate-900">{cat.name}</p>
                  <p className="mt-1 text-sm font-medium text-[#1d4ed8]">{cat.tagline}</p>
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
                  <p className="mt-4 font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Kompetenzen */}
      <section className="container py-20 sm:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Kompetenzen</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {c(content, "home.kompetenzen.title", "Wir fertigen nach Ihren Wünschen")}
            </h2>
            <p className="mt-3 text-slate-600">
              {c(
                content,
                "home.kompetenzen.text",
                "Zuschnitt, Bedruckung, Sonderwerkstoffe und zugelassene Qualität – über sechs Produktionsstrecken konfektionieren wir exakt nach Ihrer Vorgabe.",
              )}
            </p>
          </div>
          <Link
            href="/bit/kompetenzen"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
          >
            Alle Kompetenzen
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {KOMPETENZEN.map((k, i) => (
            <Reveal key={k.title} delay={i * 70} className="h-full">
              <Link href="/bit/kompetenzen" className="bit-card group flex h-full flex-col overflow-hidden">
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
            <span className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Beliebt</span>
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
        </div>
      </section>

      {/* ---------------------------------------------------------- Industries */}
      <section className="border-t border-slate-200 bg-white py-16">
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
        <div className="container mt-10 text-center">
          <Link
            href="/bit/branchen"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#1e4a7a] hover:border-[#1e4a7a]"
          >
            Branchenlösungen entdecken <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* --------------------------------------------------------------- News */}
      {latestNews.length > 0 && (
        <section className="container py-20 sm:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-[#1d4ed8]">Aktuelles</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {c(content, "home.news.title", "News aus dem Hause BIT")}
              </h2>
            </div>
            <Link
              href="/bit/news"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]"
            >
              Alle News
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((post, i) => (
              <Reveal key={post.slug} delay={i * 70} className="h-full">
                <article className="bit-card group relative flex h-full flex-col overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image} alt={post.imageAlt} className="bit-card-img h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {post.date && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.date)}
                      </span>
                    )}
                    <div className="mt-2 line-clamp-2 flex-1 font-semibold leading-snug text-slate-900">
                      <Link
                        href={`/bit/news/${post.slug}`}
                        className="before:absolute before:inset-0 hover:text-[#1e4a7a]"
                      >
                        {post.title}
                      </Link>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                      Mehr lesen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ Sortiment SEO */}
      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container">
          <Reveal as="h2" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Unser Sortiment im Überblick
          </Reveal>
          <Reveal as="div" delay={60} className="mt-4 grid gap-4 text-sm leading-relaxed text-slate-600 md:grid-cols-2">
            <p>
              <strong className="text-slate-900">Schrumpfschläuche</strong> in allen Varianten:
              halogenfreie, dünnwandige und dickwandige Schrumpfschläuche, Typen mit Kleber bzw.
              Innenkleber, hochtemperaturbeständige Schläuche aus PTFE, FEP und Kynar® (PVDF) sowie
              UL-zugelassene, farbige und bedruckte Schrumpfschläuche.
            </p>
            <p>
              <strong className="text-slate-900">Isolier- &amp; Silikonschläuche</strong>,
              <strong className="text-slate-900"> Glasseidenschläuche</strong> und
              <strong className="text-slate-900"> Geflechtschläuche</strong> aus Polyamid, Polyester
              oder Aramid für Kabelschutz, Isolation und Kabelbündelung.
            </p>
            <p>
              <strong className="text-slate-900">Wellrohre</strong> geschlitzt und ungeschlitzt aus
              PP, PA, PFA und TPE – sowie zweiteilige Wellrohre zur nachträglichen Installation.
            </p>
            <p>
              <strong className="text-slate-900">Kabelbinder &amp; Verarbeitung</strong>: Standard-,
              Edelstahl-, UV-beständige und wiederlösbare Kabelbinder, dazu Zangen, Heißluft- und
              Schrumpfgeräte. Plus Konfektion: Zuschnitt, Bedruckung und Sätze nach Maß.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-6 flex flex-wrap gap-3">
            <Link href="/bit/produkte" className="bit-btn bit-btn-dark">
              <span>Alle Produkte ansehen</span>
              <ArrowRight className="bit-arrow h-4 w-4" />
            </Link>
            <Link href="/bit/kompetenzen" className="bit-btn bit-btn-outline">
              <span>Konfektion &amp; Kompetenzen</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      <section className="border-t border-slate-200 bg-white py-20 sm:py-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-[#c27803]">FAQ</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Häufige Fragen
            </h2>
          </Reveal>
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map((f) => (
              <Reveal key={f.q} as="div" className="py-5">
                <p className="text-lg font-semibold text-slate-900">{f.q}</p>
                <p className="mt-2 leading-relaxed text-slate-600">{f.a}</p>
              </Reveal>
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
              {c(content, "home.cta.title", "Stellen Sie Ihre Anfrage zusammen")}
            </h2>
            <p className="mx-auto mt-4 text-slate-300">
              {c(
                content,
                "home.cta.text",
                "Legen Sie die gewünschten Artikel in allen benötigten Größen in den Warenkorb und senden Sie alles in einer einzigen Anfrage. Wir melden uns mit einem individuellen Angebot – in der Regel innerhalb von 24 Stunden.",
              )}
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
