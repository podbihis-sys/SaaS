import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

// One family carries the whole voice — Archivo's grotesque width axis holds
// long German compounds and the latin-ext set covers č ć š ž đ.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});
// The wordmark <adriawebcode/> is set in JetBrains Mono Bold per the logo spec.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-logo",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://adriawebcode.com";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#F2F4F5",
  width: "device-width",
  initialScale: 1,
};

/**
 * hreflang set with regional targeting: each language additionally claims
 * its primary country markets (de → DE/AT/CH, sr → RS/ME, …).
 */
function hreflangAlternates(): Record<string, string> {
  const url = (l: string) => `${SITE_URL}/${l}`;
  return {
    de: url("de"),
    "de-DE": url("de"),
    "de-AT": url("de"),
    "de-CH": url("de"),
    en: url("en"),
    hr: url("hr"),
    "hr-HR": url("hr"),
    bs: url("bs"),
    "bs-BA": url("bs"),
    sr: url("sr"),
    "sr-RS": url("sr"),
    "sr-ME": url("sr"),
    "x-default": url("de"),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: "%s | adriawebcode",
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    applicationName: "adriawebcode",
    category: "Web Design",
    authors: [{ name: "adriawebcode" }],
    creator: "adriawebcode",
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: hreflangAlternates(),
    },
    openGraph: {
      type: "website",
      locale,
      url: `${SITE_URL}/${locale}`,
      siteName: "adriawebcode",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function jsonLd(locale: Locale) {
  const dict = getDictionary(locale);
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "adriawebcode",
      url: SITE_URL,
      inLanguage: locale,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: "adriawebcode",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      image: `${SITE_URL}/${locale}/opengraph-image`,
      foundingDate: "2024",
      description: dict.meta.description,
      email: "hello@adriawebcode.com",
      priceRange: "€€",
      areaServed: [
        "Germany",
        "Austria",
        "Switzerland",
        "Croatia",
        "Bosnia and Herzegovina",
        "Serbia",
        "Montenegro",
      ],
      knowsLanguage: ["de", "en", "hr", "bs", "sr"],
      makesOffer: dict.pricing.plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.desc,
        priceCurrency: plan.price.includes("KM")
          ? "BAM"
          : plan.price.includes("RSD")
            ? "RSD"
            : "EUR",
        price: plan.price.replace(/[^\d]/g, ""),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: dict.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${archivo.variable} ${jetbrains.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(locale)) }}
        />
        {children}
      </body>
    </html>
  );
}
