import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, PRODUCTS, getCategory, type CategoryId } from "../_data/catalog";
import { Catalog } from "../_components/catalog";
import { clampDesc, seoTitle } from "../_lib/seo";

// Kategorie-URLs wie auf bit-gmbh.de (/isolierschlauch/ etc.) – statisch generiert.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ kategorie: c.id }));
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategorie: string }>;
}): Promise<Metadata> {
  const { kategorie } = await params;
  const category = getCategory(kategorie as CategoryId);
  if (!category) return {};
  const count = PRODUCTS.filter((p) => p.category === category.id).length;
  return {
    title: seoTitle(`${category.name} kaufen`),
    description: clampDesc(
      `${category.name} ${category.tagline} – ${count} Artikel bei BIT Bierther: ${category.description}`,
    ),
    alternates: { canonical: `/bit/${category.id}` },
  };
}

export default async function KategoriePage({
  params,
}: {
  params: Promise<{ kategorie: string }>;
}) {
  const { kategorie } = await params;
  const category = getCategory(kategorie as CategoryId);
  if (!category) notFound();

  const items = PRODUCTS.filter((p) => p.category === category.id);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `${BASE}/bit/${category.id}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${BASE}/bit/produkte/${p.slug}`,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/bit` },
      { "@type": "ListItem", position: 2, name: "Produkte", item: `${BASE}/bit/produkte` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${BASE}/bit/${category.id}` },
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
      <Catalog active={category.id} />
    </>
  );
}
