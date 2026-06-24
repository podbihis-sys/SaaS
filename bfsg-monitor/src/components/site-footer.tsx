import Link from "next/link";

import { DISCLAIMERS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
      <nav className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/impressum" className="hover:underline">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:underline">
          Datenschutz
        </Link>
        <Link href="/agb" className="hover:underline">
          AGB
        </Link>
        <Link href="/pricing" className="hover:underline">
          Preise
        </Link>
      </nav>
      <p>
        © {new Date().getFullYear()} BFSG-Monitor · {DISCLAIMERS.noLegalAdvice}
      </p>
    </footer>
  );
}
