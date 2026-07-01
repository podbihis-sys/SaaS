import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ScrollProgress from "@/components/ScrollProgress";
import { site } from "@/lib/site";
import { JsonLd, localBusinessJsonLd } from "@/lib/jsonld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#98c188",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} | Naturnaher Garten- & Landschaftsbau in der Eifel`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  keywords: [
    "Garten- und Landschaftsbau Bad Münstereifel",
    "Galabau Eifel",
    "naturnaher Garten Euskirchen",
    "Naturpool Eifel",
    "Schwimmteich Bad Münstereifel",
    "Bioland Gartenbau",
    "Gartenpflege Mechernich",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: site.assets.favicon, type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: site.url,
    siteName: site.legalName,
    title: `${site.legalName} | Naturnaher Garten- & Landschaftsbau`,
    description: site.description,
    images: [{ url: site.assets.logo, alt: `${site.name} Logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.legalName,
    description: site.description,
    images: [site.assets.logo],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  return (
    <html lang="de" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <JsonLd data={localBusinessJsonLd()} />
        <ScrollProgress />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        {/* Turnstile-Skript nur laden, wenn Spam-Schutz konfiguriert ist.
            Hinweis: Zum Aktivieren die Cloudflare-Domain in der CSP
            (next.config.mjs, script-src) ergänzen. */}
        {turnstileEnabled && (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}
