import type { Metadata } from "next";
import "./bit.css";
import { CartProvider } from "./_lib/cart";
import { CartDrawer } from "./_components/cart-drawer";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "BIT Bierther GmbH – Schrumpf- & Isolierschlauchtechnik",
    template: "%s · BIT Bierther GmbH",
  },
  description:
    "Schrumpfschläuche, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder vom spezialisierten Hersteller. Über 1.000 Standardartikel, Lieferung in 24 h, Konfektion ab Losgröße 1.",
};

export default function BitLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
