import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CircleCheck, FileText, Thermometer } from "lucide-react";
import { PRODUCTS, getCategory } from "../../../../_data/catalog";
import { EN_CATEGORY_LABELS, EN_PRODUCTS } from "../../../../_data/catalog-en";
import { dimLabel, formatMm } from "../../../../_data/attributes";
import {
  applicationEn,
  colorEn,
  featureEn,
  materialEn,
  numEn,
  taglineEn,
  temperatureEn,
} from "../../../../_data/terms-en";
import { getRolls } from "../../../../_data/rolls";
import { getPacks } from "../../../../_data/packs";
import { AddToCart } from "../../../../_components/add-to-cart";
import { ProductCard } from "../../../../_components/product-card";
import { ProductIllustration } from "../../../../_components/product-illustration";
import { clampDesc, seoTitle } from "../../../../_lib/seo";

/**
 * Englische Produktdetailseite – gleicher Aufbau wie die deutsche Seite;
 * Name, Beschreibung und technische Daten 1:1 aus dem englischen Original
 * (EN_PRODUCTS-Overlay), Größen-/VPE-Daten aus den DE-Tabellen.
 */

export const revalidate = 300;

const mm = (n: number) => formatMm(n, "en");

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
  // Produkte ohne Schrumpfrate: Tabelle zeigt den Innendurchmesser.
  const ohneSchrumpfung = rolls?.every((r) => r.dPost == null) ?? false;
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 3);
  // Kurze Namen wie auf der DE-Seite um die Kategorie ergänzen.
  const heading = (() => {
    const n = name.trim();
    const short = n.length < 28 || n.split(/\s+/).length < 3;
    if (!short) return n;
    const catWord = categoryLabel.toLowerCase().split(" ")[0] ?? "";
    if (catWord && !n.toLowerCase().includes(catWord)) return `${n} – ${categoryLabel}`;
    return n;
  })();
  // Die Farbzeile des Originals ist ein Scrape-Artefakt ohne Trenner – die
  // Farben stehen unten sauber aus product.colors.
  const tech = (en && en.tech.length > 0 ? en.tech : product.tech).filter(
    (row) => !(product.colors?.length && /^colou?rs?$/i.test(row.label.trim())),
  );

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";
  const imageUrl = product.image?.startsWith("/") ? `${base}${product.image}` : product.image;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: imageUrl,
    sku: product.code,
    category: categoryLabel,
    brand: { "@type": "Brand", name: "BIT" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      {/* Breadcrumb */}
      <nav className="border-b border-slate-200 bg-slate-50" aria-label="Breadcrumb">
        <div className="container flex flex-wrap items-center gap-1.5 py-4 text-sm text-slate-500">
          <Link href="/bit/en" className="hover:text-[#1e4a7a]">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/bit/en/products" className="hover:text-[#1e4a7a]">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/bit/en/products/${product.category}`} className="hover:text-[#1e4a7a]">
            {categoryLabel}
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words text-slate-900">{name}</span>
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
                alt={name}
                className="aspect-[4/3] w-full"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {product.applications.slice(0, 3).map((a) => (
                <div key={a} className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center text-xs font-medium leading-tight text-slate-600 break-words hyphens-auto">
                  {applicationEn(a)}
                </div>
              ))}
            </div>
          </div>

          {/* Info + Add to cart */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
                {categoryLabel}
              </span>
              {product.code !== name && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
                  {product.code}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{heading}</h1>
            <p className="mt-2 text-lg text-slate-600">{taglineEn(product.tagline)}</p>
            <div className="mt-5 space-y-3">
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

            {/* Specs */}
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-5 text-sm">
              <div>
                <dt className="text-slate-500">Material</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{materialEn(product.material)}</dd>
              </div>
              {product.temperature && (
                <div>
                  <dt className="flex items-center gap-1 text-slate-500">
                    <Thermometer className="h-3.5 w-3.5" /> Temperature range
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{temperatureEn(product.temperature)}</dd>
                </div>
              )}
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

        {/* Features & applications */}
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Properties</h2>
            <ul className="mt-4 space-y-1">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 px-2 py-1.5 text-sm text-slate-700">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38bdf8]" />
                  <span className="flex-1">{featureEn(f)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Typical applications</h2>
            <ul className="mt-4 space-y-2.5">
              {product.applications.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e4a7a]" />
                  {applicationEn(a)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Technical data (EN original) */}
        {tech.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Technical specifications</h2>
            </div>
            <dl className="divide-y divide-slate-100">
              {tech.map((row) => (
                <div key={row.label} className="grid grid-cols-1 gap-1 px-6 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-slate-500">{row.label}</dt>
                  <dd className="text-sm font-medium text-slate-900 sm:col-span-2">{row.value}</dd>
                </div>
              ))}
              {product.colors && product.colors.length > 0 && (
                <div className="grid grid-cols-1 gap-1 px-6 py-3 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-slate-500">Colours</dt>
                  <dd className="text-sm font-medium text-slate-900 sm:col-span-2">
                    {product.colors.map(colorEn).join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Delivery & packaging (rolls) */}
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
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">
                      {ohneSchrumpfung ? "Inner diameter" : "Ø before shrinkage"}
                    </th>
                    {!ohneSchrumpfung && (
                      <th className="px-3 py-3 font-medium">Ø after shrinkage</th>
                    )}
                    <th className="px-3 py-3 font-medium">Wall thickness</th>
                    <th className="px-6 py-3 text-right font-medium">
                      {laengenware ? "PU (length)" : "PU (m / roll)"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolls.map((r) => (
                    <tr key={r.label}>
                      <td className="px-6 py-3 font-mono font-medium text-[#1e4a7a]">{r.typ ?? "–"}</td>
                      <td className="px-3 py-3 font-medium text-slate-900">{numEn(dimLabel(r.label))}</td>
                      {!ohneSchrumpfung && (
                        <td className="px-3 py-3 text-slate-700">
                          {r.dPost != null ? `Ø ${mm(r.dPost)} mm` : "–"}
                        </td>
                      )}
                      <td className="px-3 py-3 text-slate-700">
                        {r.wall != null ? `${mm(r.wall)} mm` : "–"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">{numEn(r.vpe)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delivery & packaging (packs) */}
        {packs && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Delivery & packaging</h2>
              <p className="mt-1 text-sm text-slate-600">
                Supplied in whole packs. The number of pieces per pack (PU) depends on the size.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Length</th>
                    <th className="px-3 py-3 font-medium">Width</th>
                    <th className="px-6 py-3 text-right font-medium">PU (pcs / pack)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packs.map((p) => (
                    <tr key={p.label}>
                      <td className="px-6 py-3 font-mono font-medium text-[#1e4a7a]">{p.typ ?? "–"}</td>
                      <td className="px-3 py-3 font-medium text-slate-900">{mm(p.laenge)} mm</td>
                      <td className="px-3 py-3 text-slate-700">
                        {p.breite != null ? `${mm(p.breite)} mm` : "–"}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">{numEn(p.vpe)}</td>
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
              More from {categoryLabel}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
