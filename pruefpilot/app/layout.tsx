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
      <body>{children}</body>
    </html>
  );
}
