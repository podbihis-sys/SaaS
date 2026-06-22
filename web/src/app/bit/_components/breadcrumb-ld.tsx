import { SITE_URL } from "../_lib/site";

const BASE = SITE_URL;

/**
 * Gibt BreadcrumbList-Structured-Data (schema.org) aus. `items` ist die
 * Breadcrumb-Kette von der Startseite bis zur aktuellen Seite.
 */
export function BreadcrumbLd({ items }: { items: { name: string; path: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
