"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "../_lib/cart";
import { CartDrawer } from "./cart-drawer";
import { ContactFab } from "./contact-fab";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/**
 * Rendert die öffentliche Website-Hülle (Header/Footer/Warenkorb) NUR für die
 * öffentlichen Seiten. Auf dem abgeschotteten CMS (`/bit/admin`) wird keine
 * Website-Navigation gerendert – das Admin bringt seine eigene Navigation mit.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/bit/admin")) {
    return <>{children}</>;
  }
  return (
    <CartProvider>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-[#1e4a7a] focus:shadow-lg focus:outline focus:outline-2 focus:outline-[#1e4a7a]"
        >
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <CartDrawer />
        <ContactFab />
      </div>
    </CartProvider>
  );
}
