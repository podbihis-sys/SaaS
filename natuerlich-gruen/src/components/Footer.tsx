import Link from "next/link";
import Image from "next/image";
import { footerLinks, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 bg-anthracite-900 text-anthracite-100">
      <div className="container-content grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl text-white">{site.legalName}</p>
          <p className="mt-2 text-sm text-anthracite-300">
            Inhaber: {site.owner}
          </p>
          <p className="mt-1 text-sm text-anthracite-300">
            Bioland-zertifizierter Gartenbaubetrieb aus {site.city}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-anthracite-200">
            Wir stehen für naturnahe Gartengestaltung, nachhaltige Pflege,
            Schwimmteiche, Naturpools, Pflanzungen und ökologische Außenanlagen
            – regional, familiengeführt und zukunftsorientiert.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-4 inline-block font-medium text-moss-300 hover:text-moss-200"
          >
            {site.email}
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite-400">
            Quicklinks
          </h2>
          <ul className="mt-4 space-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-anthracite-200 hover:text-moss-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite-400">
            Folgen Sie uns
          </h2>
          <div className="mt-4 flex gap-3">
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Natürlich grün auf Facebook"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-anthracite-800 hover:bg-moss-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Natürlich grün auf Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-anthracite-800 hover:bg-moss-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Image
              src={site.assets.naturgardenSeal}
              alt="Bioland-, Naturgarten- und Galabauverband-Siegel"
              width={180}
              height={68}
              className="h-14 w-auto rounded bg-white/95 p-1.5"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-anthracite-800">
        <div className="container-content flex flex-col items-center justify-between gap-3 py-5 text-sm text-anthracite-400 sm:flex-row">
          <p>©2025 {site.name}</p>
          <p className="flex gap-4">
            <Link href="/impressum" className="hover:text-moss-300">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-moss-300">
              Datenschutz
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
