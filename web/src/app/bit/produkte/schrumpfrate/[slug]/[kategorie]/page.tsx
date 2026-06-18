import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "../../../../_data/catalog";
import {
  categoriesForProducts,
  getShrinkTaxon,
  shrinkTaxa,
} from "../../../../_data/attributes";
import { TaxonLanding } from "../../../../_components/taxon-landing";

const BASE_PATH = "/bit/produkte/schrumpfrate";

export function generateStaticParams() {
  const params: { slug: string; kategorie: string }[] = [];
  for (const t of shrinkTaxa()) {
    for (const c of categoriesForProducts(t.products)) {
      params.push({ slug: t.slug, kategorie: c.id });
    }
  }
  return params;
}

function resolve(slug: string, kategorie: string) {
  const taxon = getShrinkTaxon(slug);
  const category = getCategory(kategorie as never);
  if (!taxon || !category) return null;
  const products = taxon.products.filter((p) => p.category === category.id);
  if (products.length === 0) return null;
  return { taxon, category, products };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; kategorie: string }>;
}): Promise<Metadata> {
  const { slug, kategorie } = await params;
  const r = resolve(slug, kategorie);
  if (!r) return { title: "Seite nicht gefunden" };
  const title = `${r.category.name} mit Schrumpfrate ${r.taxon.label}`;
  const description = `${r.category.name} mit Schrumpfrate ${r.taxon.label} von BIT Bierther: ${r.products.length} Artikel mit allen verfügbaren Größen direkt anfragbar.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_PATH}/${slug}/${kategorie}` },
    openGraph: {
      type: "website",
      title: `${title} · BIT Bierther GmbH`,
      description,
      url: `${BASE_PATH}/${slug}/${kategorie}`,
    },
  };
}

export default async function ShrinkCategoryLanding({
  params,
}: {
  params: Promise<{ slug: string; kategorie: string }>;
}) {
  const { slug, kategorie } = await params;
  const r = resolve(slug, kategorie);
  if (!r) notFound();
  const { taxon, category, products } = r;

  const intro = `${category.name} mit Schrumpfrate ${taxon.label}. ${taxon.intro}`;

  const refine = [
    { label: "Alle", href: `${BASE_PATH}/${taxon.slug}`, count: taxon.products.length, active: false },
    ...categoriesForProducts(taxon.products).map((c) => ({
      label: c.name,
      href: `${BASE_PATH}/${taxon.slug}/${c.id}`,
      count: c.count,
      active: c.id === category.id,
    })),
  ];

  const related = shrinkTaxa()
    .filter((t) => t.slug !== taxon.slug)
    .map((t) => ({ slug: t.slug, label: `Schrumpfrate ${t.label}` }));

  return (
    <TaxonLanding
      kind="Schrumpfrate"
      label={category.name}
      heading={`${category.name} mit Schrumpfrate ${taxon.label}`}
      intro={intro}
      products={products}
      basePath={BASE_PATH}
      baseLabel="Schrumpfraten"
      related={related}
      parent={{ label: `Schrumpfrate ${taxon.label}`, href: `${BASE_PATH}/${taxon.slug}` }}
      refine={refine}
    />
  );
}
