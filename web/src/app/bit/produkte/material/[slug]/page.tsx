import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  categoriesForProducts,
  getMaterialTaxon,
  materialTaxa,
} from "../../../_data/attributes";
import { TaxonLanding } from "../../../_components/taxon-landing";
import { clampDesc, clampText } from "../../../_lib/seo";

const BASE_PATH = "/bit/produkte/material";

export function generateStaticParams() {
  return materialTaxa().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const taxon = getMaterialTaxon(slug);
  if (!taxon) return { title: "Material nicht gefunden" };
  const title = `${taxon.label} – Schläuche & Schrumpfschläuche`;
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

export default async function MaterialLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const taxon = getMaterialTaxon(slug);
  if (!taxon) notFound();

  const related = materialTaxa()
    .filter((t) => t.slug !== taxon.slug)
    .map((t) => ({ slug: t.slug, label: t.label }));

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
      kind="Material"
      label={taxon.label}
      heading={`${taxon.label} – Schläuche & Schrumpfschläuche`}
      intro={taxon.intro}
      products={taxon.products}
      basePath={BASE_PATH}
      baseLabel="Werkstoffe"
      related={related}
      refine={refine.length > 2 ? refine : undefined}
    />
  );
}
