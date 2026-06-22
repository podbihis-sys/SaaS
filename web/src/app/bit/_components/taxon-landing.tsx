import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "../_data/catalog";
import { ProductCard } from "./product-card";
import { SITE_URL } from "../_lib/site";

export interface RefineLink {
  label: string;
  href: string;
  count?: number;
  active?: boolean;
}

/**
 * Wiederverwendbares Layout für die SEO-Landingpages (Eigenschaften & Anwendungen),
 * inkl. optionaler Verfeinerung nach Kategorie (eigene URL je Kombination).
 * Rendert Breadcrumb, H1, Einleitung, JSON-LD (CollectionPage + ItemList +
 * BreadcrumbList) und das Produktraster.
 */
export function TaxonLanding({
  kind,
  label,
  heading,
  intro,
  products,
  basePath,
  baseLabel,
  related,
  parent,
  refine,
}: {
  kind: string;
  /** Kurzes Label für Breadcrumb/JSON-LD. */
  label: string;
  /** Überschrift (H1); falls nicht gesetzt, wird aus label abgeleitet. */
  heading?: string;
  intro: string;
  products: Product[];
  /** z. B. "/bit/produkte/eigenschaft" */
  basePath: string;
  /** z. B. "Eigenschaften" */
  baseLabel: string;
  related: { slug: string; label: string }[];
  /** Optionale übergeordnete Ebene (z. B. die Eigenschaft bei der Kategorie-Variante). */
  parent?: { label: string; href: string };
  /** Verfeinerung nach Kategorie – jede Variante hat eine eigene URL. */
  refine?: RefineLink[];
}) {
  const base = SITE_URL;
  const h1 = heading ?? `${label} – Schrumpf- & Isolierschläuche`;
  const canonicalPath = parent ? `${parent.href}` : basePath;

  const breadcrumbItems = [
    { name: "Start", item: `${base}/bit` },
    { name: "Produkte", item: `${base}/bit/produkte` },
    ...(parent ? [{ name: parent.label, item: `${base}${parent.href}` }] : []),
    { name: label, item: `${base}${canonicalPath}` },
  ];

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    description: intro,
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
    itemListElement: breadcrumbItems.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.item,
    })),
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
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link href="/bit/produkte" className="hover:text-[#1e4a7a]">Produkte</Link>
          {parent && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <Link href={parent.href} className="hover:text-[#1e4a7a]">{parent.label}</Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words text-slate-900">{label}</span>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
            {kind} · {products.length} {products.length === 1 ? "Artikel" : "Artikel"}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{h1}</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">{intro}</p>

          {/* Verfeinerung nach Kategorie – je eigene URL */}
          {refine && refine.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="self-center text-sm text-slate-500">Nach Kategorie:</span>
              {refine.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  aria-current={r.active ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    r.active
                      ? "border-[#1e4a7a] bg-[#1e4a7a] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
                  }`}
                >
                  {r.label}
                  {typeof r.count === "number" && (
                    <span className={r.active ? "text-white/70" : "text-slate-400"}>{r.count}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
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
