import Link from "next/link";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { services } from "@/lib/services";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Leistungen – Garten- & Landschaftsbau in der Eifel",
  description:
    "Unsere Leistungen: Gartenplanung, Gartenbau, Natursteinmauern, Gartenpflege, Dachbegrünung, Pflanzenanlagen und natürliche Pools – naturnah und ökologisch in der Eifel.",
  alternates: { canonical: "/leistungen" },
};

const extra = {
  slug: "pools",
  title: "Natürliche Pools",
  short:
    "Naturpools und Schwimmteiche ohne Chlor – natürlich baden im eigenen Garten.",
  href: "/pools",
};

export default function LeistungenPage() {
  const cards = [...services.map((s) => ({ ...s, href: `/leistungen/${s.slug}` })), extra];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
        ])}
      />
      <PageHeader
        title="Unsere Leistungen"
        subtitle="Vom ersten Standortverständnis bis zur langfristigen Pflege – naturnah, ökologisch und mit solidem Handwerk."
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
        ]}
      />
      <section className="container-content py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.href} delay={(i % 3) * 80}>
              <Link
                href={c.href!}
                className="group flex h-full flex-col rounded-organic border border-moss-100 bg-white p-7 transition-shadow hover:shadow-lg"
              >
                <h2 className="text-xl text-anthracite-900 group-hover:text-moss-700">
                  {c.title}
                </h2>
                <p className="mt-3 flex-1 text-anthracite-600">{c.short}</p>
                <span className="mt-5 font-medium text-moss-700">
                  Mehr erfahren →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
