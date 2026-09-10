"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "../_lib/cart";
import { ConsentProvider } from "../_lib/consent";
import { CartDrawer } from "./cart-drawer";
import { ContactRail } from "./contact-rail";
import { CookieBanner } from "./cookie-banner";
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
  const locale = pathname?.startsWith("/bit/en") ? ("en" as const) : ("de" as const);
  return (
    <ConsentProvider>
    <CartProvider>
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <a href="#bit-main" className="bit-skip-link">
          {locale === "en" ? "Skip to content" : "Zum Inhalt springen"}
        </a>
        <SiteHeader />
        <main id="bit-main">{children}</main>
        <SiteFooter locale={locale} />
        <ContactRail />
        <CartDrawer />
        <CookieBanner />
      </div>
    </CartProvider>
    </ConsentProvider>
  );
}
