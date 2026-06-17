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
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/bit/produkte/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · BIT Bierther GmbH`,
      description: product.description,
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
          <Link href={`/bit/produkte?kategorie=${product.category}`} className="hover:text-[#1e4a7a]">
            {category?.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900">{product.name}</span>
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
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.applications.slice(0, 3).map((a) => (
                <div key={a} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-medium text-slate-600">
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
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
            <p className="mt-2 text-lg text-slate-600">{product.tagline}</p>
            <p className="mt-5 leading-relaxed text-slate-700">{product.description}</p>

            {/* Specs */}
            <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-5 text-sm">
              <div>
                <dt className="text-slate-500">Material</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{product.material}</dd>
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
                <dd className="mt-0.5 font-medium text-slate-900">{product.unit}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Verfügbare Größen</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{product.sizes.length}</dd>
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
            <h2 className="text-lg font-semibold text-slate-900">Eigenschaften</h2>
            <ul className="mt-4 space-y-2.5">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38bdf8]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Typische Anwendungen</h2>
            <ul className="mt-4 space-y-2.5">
              {product.applications.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1e4a7a]" />
                  {a}
                </li>
              ))}
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
