import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Clock,
  Factory,
  Layers,
  PencilRuler,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  CATEGORIES,
  COMPANY,
  INDUSTRIES,
  PRODUCTS,
} from "./_data/catalog";
import { ProductCard } from "./_components/product-card";
import { ProductIllustration } from "./_components/product-illustration";

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
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f2742]">
        <div className="absolute inset-0 opacity-25">
          <ProductIllustration
            category="geflechtschlauch"
            fit="cover"
            className="h-full w-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2742] via-[#0f2742]/90 to-[#0f2742]/60" />
        <div className="container relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
              <BadgeCheck className="h-3.5 w-3.5 text-[#f59e0b]" />
              DIN EN ISO 9001 zertifiziert seit 1997
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Schrumpf- & Isolier&shy;schlauchtechnik aus einer Hand
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Seit {COMPANY.foundedYear} beliefern wir Automotive, Elektronik, Maschinenbau und
              Medizintechnik mit über 1.000 Standardartikeln – plus Konfektion nach Maß.
              Standardware in der Regel innerhalb von 24 Stunden.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/bit/produkte"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#e08e06]"
              >
                Sortiment entdecken <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/bit/kontakt"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Beratung anfragen
              </Link>
            </div>
          </div>
        </div>
        {/* Stat strip */}
        <div className="relative border-t border-white/10 bg-[#0c2138]">
          <div className="container grid grid-cols-2 gap-6 py-8 text-white md:grid-cols-4">
            {[
              { icon: Boxes, value: "1.000+", label: "Standardartikel" },
              { icon: Clock, value: "24 h", label: "Lieferung Standardware" },
              { icon: Factory, value: "6", label: "Produktionslinien" },
              { icon: BadgeCheck, value: "1996", label: "gegründet" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-7 w-7 text-[#f59e0b]" />
                <div>
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Unser Sortiment</h2>
          <p className="mt-3 text-slate-600">
            Sechs Produktwelten für Isolation, Schutz und Bündelung – jeder Artikel mit allen
            verfügbaren Größen direkt anfragbar.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/bit/produkte?kategorie=${cat.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <ProductIllustration
                  category={cat.id}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                <p className="mt-1 text-sm font-medium text-[#f59e0b]">{cat.tagline}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {cat.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1e4a7a]">
                  Produkte ansehen
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Warum BIT Bierther
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: "Lieferfähig in 24 h", text: "Umfassende Lagerhaltung und kundenorientierte Logistik für Standardartikel." },
              { icon: PencilRuler, title: "Konfektion ab Losgröße 1", text: "Zuschnitt, Kennzeichnung und Sätze exakt nach Ihrer Zeichnung." },
              { icon: Layers, title: "Werkstoffvielfalt", text: "Polyolefin, PVC, PTFE, Silikon, Glasseide, PVDF und mehr – für jede Anforderung." },
              { icon: ShieldCheck, title: "Geprüfte Qualität", text: "Seit 1997 nach DIN EN ISO 9001 zertifiziert – dokumentiert und rückverfolgbar." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e4a7a]/10 text-[#1e4a7a]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Beliebte Artikel</h2>
            <p className="mt-2 text-slate-600">Direkt mit allen Größen in den Warenkorb legen.</p>
          </div>
          <Link
            href="/bit/produkte"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1e4a7a] hover:underline"
          >
            Alle Produkte <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Branchen, die uns vertrauen</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Vom Bordnetz bis zur Medizintechnik – unsere Schläuche und Befestigungslösungen
            sind dort im Einsatz, wo es auf Zuverlässigkeit ankommt.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {INDUSTRIES.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="overflow-hidden rounded-3xl bg-[#0f2742] px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Stellen Sie Ihre Anfrage zusammen
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Legen Sie die gewünschten Artikel in allen benötigten Größen in den Warenkorb und
            senden Sie alles in einer einzigen Anfrage. Wir melden uns mit einem individuellen
            Angebot – in der Regel innerhalb von 24 Stunden.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/bit/produkte"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#e08e06]"
            >
              Zum Sortiment <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {COMPANY.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
