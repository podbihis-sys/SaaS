"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "../_lib/cart";
import { CartDrawer } from "./cart-drawer";
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
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
