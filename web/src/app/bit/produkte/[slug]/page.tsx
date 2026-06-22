import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, CircleCheck, FileText, Thermometer } from "lucide-react";
import {
  PRODUCTS,
  getCategory,
  getProduct,
  productsByCategory,
} from "../../_data/catalog";
import { applicationTaxa, formatMm, materialTaxa, propertyTaxonForText, slugify } from "../../_data/attributes";
import { clampText, clampDesc } from "../../_lib/seo";
import { getRolls } from "../../_data/rolls";
import { getPacks } from "../../_data/packs";
import { ProductIllustration } from "../../_components/product-illustration";
import { ProductCard } from "../../_components/product-card";
import { AddToCart } from "../../_components/add-to-cart";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Produkt nicht gefunden" };
  const categoryName = getCategory(product.category)?.name ?? "";
  let base = product.name.replace(/\s+/g, " ").trim().replace(/[\s:.]+$/u, "");
  const lc = base.toLowerCase();
  // Artikelcode-Suffix – nur Tokens, die nicht schon im Namen stehen.
  const codeTokens = (product.code || "")
    .trim()
    .split(/\s+/)
    .filter((t) => t && !lc.includes(t.toLowerCase()));
  const codeStr = codeTokens.length ? ` (${codeTokens.join(" ")})` : "";
  // Kategorie bei kurzen Namen ergänzen, wenn das Kategoriewort fehlt.
  const catWord = categoryName.toLowerCase().replace(/e?n$/u, "");
  if (base.length + codeStr.length < 26 && catWord && !lc.includes(catWord)) {
    base = `${base} – ${categoryName}`;
  }
  // Titel bauen: Code-Suffix immer erhalten (Eindeutigkeit), Basis ggf. kürzen.
  let metaTitle = base + codeStr;
  if (metaTitle.length > 58) metaTitle = clampText(base, Math.max(16, 58 - codeStr.length)) + codeStr;
  // Sehr kurze Titel mit Marke verlängern (gegen „Titel zu kurz").
  if (metaTitle.length < 34) metaTitle = `${metaTitle} · BIT Bierther GmbH`;
  const metaDesc = clampDesc(product.description || product.tagline || product.name);
  return {
    title: { absolute: metaTitle },
    description: metaDesc,
    alternates: { canonical: `/bit/produkte/${product.slug}` },
    openGraph: {
      type: "website",
      title: metaTitle,
      description: metaDesc,
      url: `/bit/produkte/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.imageAlt }] : undefined,
    },
  };
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = productsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);
  const applicationSlugs = new Set(applicationTaxa().map((t) => t.slug));
  const materialLink = materialTaxa().find((t) => t.products.includes(product));
  const rolls = getRolls(product.slug);
  const packs = !rolls ? getPacks(product.slug) : undefined;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";
  const imageUrl = product.image?.startsWith("/") ? `${base}${product.image}` : product.image;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrl,
    sku: product.code,
    category: category?.name,
    brand: { "@type": "Brand", name: "BIT Bierther GmbH" },
    // B2B-Anfragemodell: keine öffentlichen Preise. Ein gültiges Offer mit
    // Verfügbarkeit, Währung, URL und Verkäufer behebt den Strukturdaten-Fehler
    // „Either offers, review or aggregateRating should be specified" – ohne
    // erfundene Preise.
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      url: `${base}/bit/produkte/${product.slug}`,
      seller: { "@type": "Organization", name: "BIT Bierther GmbH" },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: `${base}/bit` },
      { "@type": "ListItem", position: 2, name: "Produkte", item: `${base}/bit/produkte` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${base}/bit/produkte/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
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
          <Link href={`/bit/produkte/kategorie/${product.category}`} className="hover:text-[#1e4a7a]">
            {category?.name}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words text-slate-900">{product.name}</span>
        </div>
      </nav>

      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Visual */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <ProductIllustration
                category={product.category}
                src={product.image}
                alt={product.imageAlt}
                className="aspect-[4/3] w-full"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {product.applications.slice(0, 3).map((a) => (
                <div key={a} className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center text-xs font-medium leading-tight text-slate-600 break-words hyphens-auto">
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* Info + Add to cart */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
                {category?.name}
              </span>
              {product.code !== product.name && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
                  {product.code}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {(() => {
                const n = product.name.trim();
                const short = n.length < 28 || n.split(/\s+/).length < 3;
                if (!short) return n;
                const catWord = category?.name.toLowerCase().replace(/e?n$/u, "") ?? "";
                if (category && catWord && !n.toLowerCase().includes(catWord)) return `${n} – ${category.name}`;
                const tag = (product.tagline || "").trim();
                if (tag && !n.toLowerCase().includes(tag.toLowerCase().slice(0, 6))) return `${n} – ${tag}`;
                return category ? `${n} – ${category.name}` : n;
              })()}
            </h1>
            <p className="mt-2 text-lg text-slate-600">{product.tagline}</p>
            <p className="mt-5 leading-relaxed text-slate-700">{product.description}</p>

            {/* Specs */}
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-5 text-sm">
              <div>
                <dt className="text-slate-500">Material</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {materialLink ? (
                    <Link
                      href={`/bit/produkte/material/${materialLink.slug}`}
                      className="text-[#1e4a7a] underline decoration-[#1e4a7a]/30 underline-offset-2 hover:decoration-[#1e4a7a]"
                    >
                      {product.material}
                    </Link>
                  ) : (
                    product.material
                  )}
                </dd>
              </div>
              {product.temperature && (
                <div>
                  <dt className="flex items-center gap-1 text-slate-500">
                    <Thermometer className="h-3.5 w-3.5" /> Temperaturbereich
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{product.temperature}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Bezugseinheit</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {rolls
                    ? "Rolle (nur ganze Rollen)"
                    : packs
                      ? "Gebinde (nur ganze Gebinde)"
                      : product.unit}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Verfügbare Größen</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {rolls ? rolls.length : packs ? packs.length : product.sizes.length}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <AddToCart product={product} />
            </div>
          </div>
        </div>

        {/* Features & applications */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Eigenschaften</h2>
              <span className="text-xs text-slate-400">Eigenschaft anklicken für passende Produkte</span>
            </div>
            <ul className="mt-4 space-y-1">
              {product.features.map((f) => {
                const taxon = propertyTaxonForText(f);
                if (!taxon) {
                  return (
                    <li key={f} className="flex items-start gap-2.5 px-2 py-1.5 text-sm text-slate-700">
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38bdf8]" />
                      <span className="flex-1">{f}</span>
                    </li>
                  );
                }
                return (
                  <li key={f}>
                    <Link
                      href={`/bit/produkte/eigenschaft/${taxon.slug}`}
                      className="group/feat -mx-2 flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium text-[#1e4a7a] transition-colors hover:bg-[#1e4a7a]/5"
                    >
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38bdf8]" />
                      <span className="flex-1 underline decoration-[#1e4a7a]/30 underline-offset-2 group-hover/feat:decoration-[#1e4a7a]">
                        {f}
                      </span>
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover/feat:translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Typische Anwendungen</h2>
            <ul className="mt-4 space-y-2.5">
              {product.applications.map((a) => {
                const slug = slugify(a);
                const li = (
                  <>
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e4a7a]" />
                    {a}
                  </>
                );
                return applicationSlugs.has(slug) ? (
                  <li key={a}>
                    <Link
                      href={`/bit/produkte/anwendung/${slug}`}
                      className="flex items-start gap-2.5 text-sm text-slate-700 hover:text-[#1e4a7a]"
                    >
                      {li}
                    </Link>
                  </li>
                ) : (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-slate-700">
                    {li}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Technische Daten (verbatim vom Hersteller) */}
        {product.tech.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Technische Daten</h2>
              {product.datasheet && (
                <a
                  href={product.datasheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1e4a7a] hover:underline"
                >
                  <FileText className="h-4 w-4" /> Produktdatenblatt (PDF)
                </a>
              )}
            </div>
            <dl className="divide-y divide-slate-100">
              {product.tech.map((row) => (
                <div key={row.label} className="grid grid-cols-1 gap-1 px-6 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-slate-500">{row.label}</dt>
                  <dd className="text-sm font-medium text-slate-900 sm:col-span-2">{row.value}</dd>
                </div>
              ))}
              {product.colors && product.colors.length > 0 && (
                <div className="grid grid-cols-1 gap-1 px-6 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-slate-500">Farben</dt>
                  <dd className="text-sm font-medium text-slate-900 sm:col-span-2">
                    {product.colors.join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Lieferform & Verpackung (VPE pro Rolle) */}
        {rolls && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Lieferform & Verpackung</h2>
              <p className="mt-1 text-sm text-slate-600">
                Lieferung in ganzen Rollen. Die Meterzahl je Rolle (VPE) hängt vom Durchmesser ab –
                je kleiner der Durchmesser, desto mehr Meter pro Rolle.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Ø vor Schrumpfung</th>
                    <th className="px-3 py-3 font-medium">Ø nach Schrumpfung</th>
                    <th className="px-3 py-3 font-medium">Wandstärke</th>
                    <th className="px-6 py-3 text-right font-medium">VPE (m / Rolle)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolls.map((r) => (
                    <tr key={r.label}>
                      <td className="px-6 py-3 font-medium text-slate-900">{r.label}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {r.dPost != null ? `Ø ${formatMm(r.dPost)} mm` : "–"}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {r.wall != null ? `${formatMm(r.wall)} mm` : "–"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">
                        {r.metersPerRoll} m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lieferform & Verpackung (VPE pro Gebinde – Stückware) */}
        {packs && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Lieferform & Verpackung</h2>
              <p className="mt-1 text-sm text-slate-600">
                Lieferung in ganzen Gebinden. Die Stückzahl je Gebinde (VPE) hängt von der Größe ab.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Länge</th>
                    <th className="px-3 py-3 font-medium">Breite</th>
                    <th className="px-6 py-3 text-right font-medium">VPE (Stück / Gebinde)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packs.map((p) => (
                    <tr key={p.label}>
                      <td className="px-6 py-3 font-medium text-slate-900">{formatMm(p.laenge)} mm</td>
                      <td className="px-3 py-3 text-slate-700">
                        {p.breite != null ? `${formatMm(p.breite)} mm` : "–"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">{p.vpe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Weitere Artikel aus {category?.name}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
