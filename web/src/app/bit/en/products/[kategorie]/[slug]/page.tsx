import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import { PRODUCTS, getCategory, type CategoryId } from "../../../../_data/catalog";
import { EN_CATEGORY_LABELS, EN_PRODUCTS } from "../../../../_data/catalog-en";
import { getRolls } from "../../../../_data/rolls";
import { getPacks } from "../../../../_data/packs";
import { AddToCart } from "../../../../_components/add-to-cart";
import { ProductCard } from "../../../../_components/product-card";
import { ProductIllustration } from "../../../../_components/product-illustration";
import { clampDesc, seoTitle } from "../../../../_lib/seo";

/**
 * Englische Produktdetailseite – gleiches Layout wie die deutsche Seite,
 * Texte (Name, Beschreibung, technische Daten) 1:1 aus dem englischen
 * Original (EN_PRODUCTS-Overlay); Größen-/VPE-Daten aus den DE-Tabellen.
 */

export const revalidate = 300;

function formatMm(n: number) {
  return n.toLocaleString("en-GB", { maximumFractionDigits: 2 });
}

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ kategorie: p.category, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  const en = EN_PRODUCTS[slug];
  if (!product) return {};
  return {
    alternates: { canonical: `/bit/en/products/${product.category}/${slug}` },
    title: seoTitle(en?.name ?? product.name),
    description: clampDesc(en?.description ?? product.description),
  };
}

export default async function EnProductPage({
  params,
}: {
  params: Promise<{ kategorie: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const en = EN_PRODUCTS[slug];
  const name = en?.name ?? product.name;
  const description = en?.description ?? product.description;
  const datasheet = en?.datasheet || product.datasheet;
  const category = getCategory(product.category);
  const categoryLabel = EN_CATEGORY_LABELS[product.category] ?? category?.name ?? "";
  const rolls = getRolls(product.slug);
  const packs = !rolls ? getPacks(product.slug) : undefined;
  const laengenware =
    product.vpeType === "laenge" ||
    (!product.vpeType && (rolls?.every((r) => r.vpe.includes("1,22")) ?? false));
  const auchAlsLaenge = product.vpeType === "rolle_laenge";
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 bg-slate-50" aria-label="Breadcrumb">
        <div className="container flex flex-wrap items-center gap-1.5 py-3.5 text-sm text-slate-500">
          <Link href="/bit/en" className="hover:text-[#1e4a7a]">Home</Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <Link href="/bit/en/products" className="hover:text-[#1e4a7a]">Products</Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <Link href={`/bit/en/products/${product.category}`} className="hover:text-[#1e4a7a]">
            {categoryLabel}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words text-slate-900">{product.code}</span>
        </div>
      </nav>

      <div className="container py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Bild */}
          <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <ProductIllustration
              category={product.category}
              src={product.image}
              alt={product.imageAlt}
              className="aspect-[4/3] h-auto w-full"
            />
            {product.code && (
              <span className="absolute left-4 top-4 rounded-md bg-[#38bdf8] px-3 py-1 font-mono text-base font-bold text-[#0f2742] shadow-sm">
                {product.code}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
              {categoryLabel}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {name}
            </h1>
            <div className="mt-4 space-y-3">
              {description.split(/\n\n+/).map((p) => (
                <p key={p.slice(0, 40)} className="leading-relaxed text-slate-700">
                  {p}
                </p>
              ))}
            </div>
            {datasheet && (
              <p className="mt-5">
                <a
                  href={datasheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e4a7a] hover:underline"
                >
                  <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    <FileText className="h-3 w-3" aria-hidden="true" /> PDF
                  </span>
                  Product data sheet
                </a>
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Order unit</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {laengenware
                    ? "Length (1.22 m each)"
                    : rolls
                      ? auchAlsLaenge
                        ? "Roll · also available as 1.22 m length"
                        : "Roll (whole rolls only)"
                      : packs
                        ? "Pack (whole packs only)"
                        : product.unit === "Meter"
                          ? "Metre"
                          : "Piece"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Available sizes</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {rolls ? rolls.length : packs ? packs.length : product.sizes.length}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <AddToCart product={product} locale="en" />
            </div>
          </div>
        </div>

        {/* Technische Daten (EN-Original) */}
        {en && en.tech.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Technical Specifications</h2>
            </div>
            <dl className="grid gap-x-8 px-6 py-4 sm:grid-cols-2">
              {en.tech.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-b-0"
                >
                  <dt className="text-slate-500">{row.label}</dt>
                  <dd className="text-right font-medium text-slate-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Lieferform & Verpackung */}
        {rolls && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Delivery & packaging</h2>
              <p className="mt-1 text-sm text-slate-600">
                {laengenware
                  ? "Supplied as fixed lengths: every size ships in lengths of 1.22 m."
                  : "Supplied in whole rolls. Metres per roll (PU) depend on the diameter – the smaller the diameter, the more metres per roll."}
                {auchAlsLaenge && " Every size is also available as a 1.22 m length."}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Ø before shrinkage</th>
                    <th className="px-3 py-3 font-medium">Ø after shrinkage</th>
                    <th className="px-3 py-3 font-medium">Wall thickness</th>
                    <th className="px-6 py-3 text-right font-medium">
                      {laengenware ? "PU (length)" : "PU (m / roll)"}
                    </th>
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
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">{r.vpe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Verwandte Produkte */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              More from {categoryLabel}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  locale="en"
                  href={`/bit/en/products/${p.category}/${p.slug}`}
                  nameOverride={EN_PRODUCTS[p.slug]?.name}
                  categoryLabel={EN_CATEGORY_LABELS[p.category]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
