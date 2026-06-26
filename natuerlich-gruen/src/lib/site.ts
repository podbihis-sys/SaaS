/**
 * Zentrale Unternehmens- und Seiten-Konfiguration.
 * Wird für Footer, Impressum, Schema.org (JSON-LD) und Metadaten verwendet.
 */

export const site = {
  name: "natürlich grün",
  legalName: "natürlich grün – Garten- und Landschaftsbau e.K.",
  owner: "Benedikt Brockmann",
  tagline: "Naturnaher Garten- und Landschaftsbau in der Eifel seit 2015.",
  description:
    "Naturnaher Garten- und Landschaftsbau in der Eifel. Bioland-zertifiziert. Ökologische Gartenplanung, Gartenpflege, Natursteinmauern, Naturpools und Schwimmteiche rund um Bad Münstereifel, Mechernich und Euskirchen.",
  foundedYear: 2015,
  email: "info@natuerlichgruen.net",
  city: "Bad Münstereifel",
  region: "Eifel",
  areaServed: ["Bad Münstereifel", "Mechernich", "Euskirchen", "Nettersheim"],
  // Per Default die Produktionsdomain; lokal über NEXT_PUBLIC_SITE_URL übersteuerbar.
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://natuerlichgruen.net",
  social: {
    facebook: "https://www.facebook.com/p/Natürlich-grün-100067311920555/",
    instagram: "https://www.instagram.com/natuerlich_gruen_",
  },
  // Von der Originalseite übernommene, nun lokal gehostete Assets
  // (werden via next/image automatisch zu WebP/AVIF optimiert und responsiv
  // ausgeliefert). Quelldateien liegen unter /public/img.
  assets: {
    logo: "/img/logo.png",
    favicon: "/img/favicon.svg",
    biolandSeal: "/img/bioland-naturgarten-banner.jpg",
    naturgardenSeal: "/img/siegel-verbaende.png",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const mainNav: NavItem[] = [
  { label: "Startseite", href: "/" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Bioland", href: "/bioland" },
  { label: "Blog", href: "/blog" },
  {
    label: "Leistungen",
    href: "/leistungen",
    children: [
      { label: "Gartenplanung", href: "/leistungen/gartenplanung" },
      { label: "Gartenbau", href: "/leistungen/gartenbau" },
      { label: "Natursteinmauern", href: "/leistungen/natursteinmauern" },
      { label: "Gartenpflege", href: "/leistungen/gartenpflege" },
      { label: "Dachbegrünung", href: "/leistungen/dachbegruenung" },
      { label: "Pflanzenanlagen", href: "/leistungen/pflanzenanlagen" },
      { label: "Natürliche Pools", href: "/pools" },
    ],
  },
  { label: "Kontakt", href: "/kontakt" },
];

export const footerLinks: NavItem[] = [
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Bioland & Nachhaltigkeit", href: "/bioland" },
  { label: "Galabau", href: "/leistungen/gartenbau" },
  { label: "Gartenpool", href: "/pools" },
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];
