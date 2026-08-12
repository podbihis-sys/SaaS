import type { Metadata } from "next";
import "./bit.css";
import { COMPANY } from "./_data/catalog";
import { SiteChrome } from "./_components/site-chrome";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

const DESCRIPTION =
  "Halogenfreie Schrumpfschläuche, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder vom spezialisierten Hersteller. Über 1.000 Standardartikel, Lieferung in 24 h, Zuschnitt und Bedruckung.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/bit/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/bit/favicon.png",
  },
  title: {
    default: "BIT – Schrumpf- & Isolierschlauchtechnik",
    template: "%s · BIT",
  },
  description: DESCRIPTION,
  applicationName: "BIT",
  keywords: [
    "Schrumpfschlauch",
    "Schrumpfschlauch halogenfrei",
    "Schrumpfschlauch mit Kleber",
    "Schrumpfschlauch mit Innenkleber",
    "dünnwandiger Schrumpfschlauch",
    "dickwandiger Schrumpfschlauch",
    "Schrumpfschlauch bedruckt",
    "Schrumpfschlauch farbig",
    "PTFE Schrumpfschlauch",
    "Kynar PVDF Schrumpfschlauch",
    "UL-zugelassener Schrumpfschlauch",
    "Isolierschlauch",
    "Silikonschlauch",
    "Glasseidenschlauch",
    "Geflechtschlauch",
    "Geflechtschlauch Polyamid",
    "Wellrohr",
    "Wellrohr geschlitzt",
    "Kabelbinder",
    "Edelstahl-Kabelbinder",
    "Kabelschutz",
    "Kabelbündelung",
    "halogenfrei",
    "Isolierschlauchtechnik",
    "BIT",
  ],
  authors: [{ name: COMPANY.shortName }],
  openGraph: {
    type: "website",
    siteName: "BIT",
    locale: "de_DE",
    title: "BIT – Schrumpf- & Isolierschlauchtechnik",
    description: DESCRIPTION,
    images: [{ url: "/bit/logo.png", alt: "BIT" }],
  },
  twitter: {
    card: "summary",
    title: "BIT – Schrumpf- & Isolierschlauchtechnik",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function BitLayout({ children }: { children: React.ReactNode }) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.shortName,
    legalName: COMPANY.legalName,
    url: `${BASE}/bit`,
    logo: `${BASE}/bit/logo.png`,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    foundingDate: String(COMPANY.foundedYear),
    vatID: COMPANY.vatId,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.zip,
      addressLocality: COMPANY.city,
      addressCountry: "DE",
    },
  };

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE}/bit#business`,
    name: COMPANY.shortName,
    legalName: COMPANY.legalName,
    url: `${BASE}/bit`,
    logo: `${BASE}/bit/logo.png`,
    image: `${BASE}/bit/logo.png`,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    faxNumber: COMPANY.fax,
    vatID: COMPANY.vatId,
    foundingDate: String(COMPANY.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.zip,
      addressLocality: COMPANY.city,
      addressCountry: "DE",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: COMPANY.phone,
      email: COMPANY.email,
      areaServed: "DE",
      availableLanguage: ["de", "en"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <SiteChrome>{children}</SiteChrome>
    </>
  );
}
