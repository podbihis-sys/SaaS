import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });
const sora = Sora({ subsets: ["latin", "latin-ext"], variable: "--font-display" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://adriawebcode.com";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}`]));

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: "%s | adriawebcode",
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    authors: [{ name: "adriawebcode" }],
    creator: "adriawebcode",
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: { ...languages, "x-default": `${SITE_URL}/de` },
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
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#organization`,
      name: "adriawebcode",
      url: SITE_URL,
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
    <html lang={locale} className={`${inter.variable} ${sora.variable}`}>
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
