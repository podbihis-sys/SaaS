import { site } from "./site";

/** LocalBusiness / LandscapingBusiness – globales Geschäfts-Schema. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LandscapingBusiness",
    "@id": `${site.url}/#business`,
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    image: site.assets.logo,
    logo: site.assets.logo,
    founder: { "@type": "Person", name: site.owner },
    foundingDate: String(site.foundedYear),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: "Nordrhein-Westfalen",
      addressCountry: "DE",
    },
    areaServed: site.areaServed.map((name) => ({ "@type": "City", name })),
    knowsAbout: [
      "Naturnaher Garten- und Landschaftsbau",
      "Bioland-zertifizierter Gartenbau",
      "Gartenpflege",
      "Naturpools",
      "Schwimmteiche",
    ],
    sameAs: [site.social.facebook, site.social.instagram],
  };
}

/** BreadcrumbList für eine beliebige Seite. */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

/** Article-Schema für Blogbeiträge. */
export function articleJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "de-DE",
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: site.legalName },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
      logo: { "@type": "ImageObject", url: site.assets.logo },
    },
  };
}

/** Hilfskomponente zum sicheren Einbetten von JSON-LD. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify ist sicher gegen XSS, da nur strukturierte Daten enthalten sind.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
