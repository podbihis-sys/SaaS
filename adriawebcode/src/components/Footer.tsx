import Link from "next/link";
import { locales, localeNames, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#04060f] py-16">
      <div className="container-site">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-lg font-bold text-white">
              adria<span className="text-adriatic-400">web</span>code
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">{dict.footer.tagline}</p>
            <p className="mt-3 text-xs text-slate-500">{dict.footer.noHosting}</p>
            <a
              href="mailto:hello@adriawebcode.com"
              className="mt-4 inline-block text-sm text-adriatic-300 transition hover:text-adriatic-200"
            >
              hello@adriawebcode.com
            </a>
          </div>

          <nav aria-label={dict.footer.company}>
            <h3 className="mb-4 text-sm font-semibold text-white">{dict.footer.company}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li><a href="#services" className="transition hover:text-adriatic-300">{dict.nav.services}</a></li>
              <li><a href="#pricing" className="transition hover:text-adriatic-300">{dict.nav.pricing}</a></li>
              <li><a href="#maintenance" className="transition hover:text-adriatic-300">{dict.nav.maintenance}</a></li>
              <li><a href="#contact" className="transition hover:text-adriatic-300">{dict.nav.contact}</a></li>
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">{dict.footer.legal}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link href={`/${locale}/impressum`} className="transition hover:text-adriatic-300">
                  {dict.footer.imprint}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/datenschutz`} className="transition hover:text-adriatic-300">
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
                    className={l === locale ? "text-adriatic-300" : "text-slate-400 transition hover:text-adriatic-300"}
                    hrefLang={l}
                  >
                    {localeNames[l]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-slate-500">
          © {year} adriawebcode. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
