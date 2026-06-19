import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  categoriesForProducts,
  getPropertyTaxon,
  propertyTaxa,
} from "../../../_data/attributes";
import { TaxonLanding } from "../../../_components/taxon-landing";
import { clampDesc, clampText } from "../../../_lib/seo";

const BASE_PATH = "/bit/produkte/eigenschaft";

export function generateStaticParams() {
  return propertyTaxa().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const taxon = getPropertyTaxon(slug);
  if (!taxon) return { title: "Eigenschaft nicht gefunden" };
  const title = `${taxon.label} – Schrumpf- & Isolierschläuche`;
  return {
    title: clampText(title, 60),
    description: clampDesc(taxon.intro),
    alternates: { canonical: `${BASE_PATH}/${taxon.slug}` },
    openGraph: {
      type: "website",
      title: `${title} · BIT Bierther GmbH`,
      description: clampDesc(taxon.intro),
      url: `${BASE_PATH}/${taxon.slug}`,
    },
  };
}

export default async function PropertyLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const taxon = getPropertyTaxon(slug);
  if (!taxon) notFound();

  const related = propertyTaxa()
    .filter((t) => t.slug !== taxon.slug)
    .map((t) => ({ slug: t.slug, label: t.label }));

  // Verfeinerung nach Kategorie – jede Kombination hat eine eigene URL.
  const refine = [
    { label: "Alle", href: `${BASE_PATH}/${taxon.slug}`, count: taxon.products.length, active: true },
    ...categoriesForProducts(taxon.products).map((c) => ({
      label: c.name,
      href: `${BASE_PATH}/${taxon.slug}/${c.id}`,
      count: c.count,
      active: false,
    })),
  ];

  return (
    <TaxonLanding
      kind="Eigenschaft"
      label={taxon.label}
      intro={taxon.intro}
      products={taxon.products}
      basePath={BASE_PATH}
      baseLabel="Eigenschaften"
      related={related}
      refine={refine.length > 2 ? refine : undefined}
    />
  );
}
