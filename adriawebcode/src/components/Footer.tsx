import Link from "next/link";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Logo } from "./Logo";

/** Continues the tiefsee plane of the contact section above it. */
export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tiefsee pb-14 pt-2">
      <div className="container-site border-t border-white/20 pt-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size="sm" inverted />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{dict.footer.tagline}</p>
            <p className="mt-3 text-xs text-white/60">{dict.footer.noHosting}</p>
            <a
              href="mailto:hello@adriawebcode.com"
              className="mt-4 inline-block text-sm text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
            >
              hello@adriawebcode.com
            </a>
          </div>

          <nav aria-label={dict.footer.company}>
            <h3 className="mb-4 text-sm font-semibold text-white">{dict.footer.company}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              <li><a href="#services" className="transition-colors hover:text-white">{dict.nav.services}</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-white">{dict.nav.pricing}</a></li>
              <li><a href="#maintenance" className="transition-colors hover:text-white">{dict.nav.maintenance}</a></li>
              <li><a href="#contact" className="transition-colors hover:text-white">{dict.nav.contact}</a></li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">{dict.footer.legal}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-white/70">
              <li>
                <Link href={`/${locale}/impressum`} className="transition-colors hover:text-white">
                  {dict.footer.imprint}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/datenschutz`} className="transition-colors hover:text-white">
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
            </ul>
            <h3 className="mb-3 mt-6 text-sm font-semibold text-white">{dict.footer.languages}</h3>
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
              {locales.map((l) => (
                <li key={l}>
                  <a
                    href={`/${l}`}
                    className={
                      l === locale
                        ? "font-semibold text-white"
                        : "text-white/70 transition-colors hover:text-white"
                    }
                    hrefLang={l}
                  >
                    {localeNames[l]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/20 pt-6 text-center text-xs text-white/60">
          © {year} adriawebcode. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
