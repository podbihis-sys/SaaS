import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrüfPilot – Prüffristen & DGUV-Dokumentation für KMU",
  description:
    "Gesetzliche Prüfpflichten digital verwalten: DGUV-V3, UVV, Feuerlöscher. Automatische Erinnerungen, Audit-Export per Klick. 14 Tage kostenlos testen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
