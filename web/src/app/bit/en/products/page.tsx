import type { Metadata } from "next";
import { CatalogEnView } from "../../_components/catalog-en-view";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/products" },
  title: "Products",
  description:
    "More than 1,000 standard articles: heat-shrink tubing, insulating tubing, braided sleeves, corrugated conduits, cable ties and tools.",
};

export default function EnProductsPage() {
  return <CatalogEnView active="alle" />;
}
