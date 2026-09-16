import type { Metadata } from "next";

const DESCRIPTION =
  "Halogen-free heat-shrink, insulating and braided sleeves, corrugated conduits and cable ties. 1,000+ articles, delivery within 24 h, cutting and printing.";

/** Englische Metadaten für alle /bit/en-Routen (Titelzusatz, Open Graph). */
export const metadata: Metadata = {
  // Der Standardtitel läuft durch das Eltern-Template „%s · BIT“.
  title: {
    default: "Heat-shrink & insulating tubing technology",
    template: "%s · BIT",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "BIT",
    locale: "en_GB",
    title: "BIT – Heat-shrink & insulating tubing technology",
    description: DESCRIPTION,
    images: [{ url: "/bit/logo.png", alt: "BIT" }],
  },
  twitter: {
    card: "summary",
    title: "BIT – Heat-shrink & insulating tubing technology",
    description: DESCRIPTION,
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
