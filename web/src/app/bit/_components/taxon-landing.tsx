import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "../_data/catalog";
import { ProductCard } from "./product-card";

export interface TaxonLink {
  slug: string;
  label: string;
}

/**
 * Wiederverwendbares Layout für die SEO-Landingpages (Eigenschaften & Anwendungen).
 * Rendert Breadcrumb, H1, Einleitung, JSON-LD (CollectionPage + ItemList +
 * BreadcrumbList) und das Produktraster.
 */
export function TaxonLanding({
  kind,
  label,
  intro,
  products,
  basePath,
  baseLabel,
  related,
}: {
  kind: "Eigenschaft" | "Anwendung";
  label: string;
  intro: string;
  products: Product[];
  /** z. B. "/bit/produkte/eigenschaft" */
  basePath: string;
  /** z. B. "Eigenschaften" */
  baseLabel: string;
  related: { slug: string; label: string }[];
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";
  const heading = `${label} – Schrumpf- & Isolierschläuche`;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: heading,
    description: intro,
    url: `${base}${basePath}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${base}/bit/produkte/${p.slug}`,
        name: p.name,
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${base}/bit` },
      { "@type": "ListItem", position: 2, name: "Produkte", item: `${base}/bit/produkte` },
      { "@type": "ListItem", position: 3, name: label, item: `${base}${basePath}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 bg-slate-50">
        <div className="container flex flex-wrap items-center gap-1.5 py-4 text-sm text-slate-500">
          <Link href="/bit" className="hover:text-[#1e4a7a]">Start</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/bit/produkte" className="hover:text-[#1e4a7a]">Produkte</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900">{label}</span>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
            {kind} · {products.length} Artikel
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{heading}</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">{intro}</p>
        </div>
      </section>

      {/* Products */}
      <div className="container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-14 border-t border-slate-200 pt-8">
            <h2 className="text-lg font-semibold text-slate-900">Weitere {baseLabel}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`${basePath}/${t.slug}`}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
