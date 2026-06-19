import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Produkte – Schrumpf- & Isolierschläuche · BIT Bierther" },
  description:
    "1.000+ Artikel: Schrumpf-, Isolier-, Glasseiden- & Geflechtschläuche, Wellrohre, Kabelbinder – filterbar nach Material, Schrumpfrate & Temperatur.",
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
