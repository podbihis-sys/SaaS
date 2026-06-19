import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produkte – Schrumpfschläuche, Isolier- & Geflechtschläuche",
  description:
    "Über 1.000 Standardartikel: Schrumpfschläuche, Isolier-, Glasseiden- und Geflechtschläuche, Wellrohre, Kabelbinder & Verarbeitungsgeräte. Filtern nach Material, Wandstärke, Schrumpfrate und Temperatur – Lieferung in 24 h, Konfektion ab Losgröße 1.",
  keywords: [
    "Schrumpfschlauch kaufen",
    "Schrumpfschlauch mit Kleber",
    "Isolierschlauch",
    "Geflechtschlauch",
    "Glasseidenschlauch",
    "Wellrohr",
    "Kabelbinder",
    "halogenfrei",
    "PTFE Schrumpfschlauch",
    "Silikonschlauch",
  ],
  alternates: { canonical: "/bit/produkte" },
  openGraph: {
    type: "website",
    title: "Produkte – BIT Bierther GmbH",
    description:
      "Über 1.000 Standardartikel aus Schrumpf-, Isolier- und Geflechtschlauchtechnik – filterbar nach Material, Wandstärke, Schrumpfrate und Temperatur.",
    url: "/bit/produkte",
  },
};

export default function ProdukteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
