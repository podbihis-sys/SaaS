import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "BFSG-Monitor — Barrierefreiheit überwachen",
    template: "%s · BFSG-Monitor",
  },
  description:
    "Automatischer WCAG-Check, priorisierte Mängelliste und laufendes Monitoring der Barrierefreiheit Ihrer Website. Monitoring-Tool, keine Rechtsberatung.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "BFSG-Monitor",
    title: "BFSG-Monitor — Barrierefreiheit überwachen",
    description:
      "Automatischer WCAG-Check und laufendes Monitoring der Barrierefreiheit Ihrer Website.",
  },
  twitter: { card: "summary" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
