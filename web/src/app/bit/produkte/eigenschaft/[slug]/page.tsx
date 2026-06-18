import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyTaxon, propertyTaxa } from "../../../_data/attributes";
import { TaxonLanding } from "../../../_components/taxon-landing";

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
    title,
    description: taxon.intro,
    alternates: { canonical: `${BASE_PATH}/${taxon.slug}` },
    openGraph: {
      type: "website",
      title: `${title} · BIT Bierther GmbH`,
      description: taxon.intro,
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

  return (
    <TaxonLanding
      kind="Eigenschaft"
      label={taxon.label}
      intro={taxon.intro}
      products={taxon.products}
      basePath={BASE_PATH}
      baseLabel="Eigenschaften"
      related={related}
    />
  );
}
