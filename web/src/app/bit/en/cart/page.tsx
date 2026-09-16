import type { Metadata } from "next";
import { CartPageView } from "../../_components/cart-page";

export const metadata: Metadata = {
  title: "Cart & inquiry",
  description: "Review your selected articles and send a single, non-binding inquiry to BIT.",
  alternates: { canonical: "/bit/en/cart" },
  robots: { index: false, follow: true },
};

export default function EnglishCartPage() {
  return <CartPageView locale="en" />;
}
