import type { Metadata } from "next";
import "./bit.css";
import { COMPANY } from "./_data/catalog";
import { SiteChrome } from "./_components/site-chrome";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

const DESCRIPTION =
  "Schrumpfschläuche, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder vom spezialisierten Hersteller. Über 1.000 Standardartikel, Lieferung in 24 h, Konfektion ab Losgröße 1.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "BIT Bierther GmbH – Schrumpf- & Isolierschlauchtechnik",
    template: "%s · BIT Bierther GmbH",
  },
  description: DESCRIPTION,
  applicationName: "BIT Bierther GmbH",
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
    "BIT Bierther",
  ],
  authors: [{ name: COMPANY.legalName }],
  openGraph: {
    type: "website",
    siteName: "BIT Bierther GmbH",
    locale: "de_DE",
    title: "BIT Bierther GmbH – Schrumpf- & Isolierschlauchtechnik",
    description: DESCRIPTION,
    images: [{ url: "/bit/logo.png", alt: "BIT Bierther GmbH" }],
  },
  twitter: {
    card: "summary",
    title: "BIT Bierther GmbH – Schrumpf- & Isolierschlauchtechnik",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function BitLayout({ children }: { children: React.ReactNode }) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
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
    name: COMPANY.legalName,
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
