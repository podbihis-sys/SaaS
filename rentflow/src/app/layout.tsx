import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "RentFlow — Buchungssystem für Verleih-Betriebe",
    template: "%s · RentFlow",
  },
  description:
    "Schluss mit Doppelbuchungen: Online-Buchungssystem für Verleih-Betriebe mit Live-Verfügbarkeit und gesicherter Anzahlung/Kaution per Stripe.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "RentFlow",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="de">
      <head>
        {plausible ? (
          // Plausible: cookieless, GDPR-friendly analytics (prompt §5).
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script defer data-domain={plausible} src="https://plausible.io/js/script.js" />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
