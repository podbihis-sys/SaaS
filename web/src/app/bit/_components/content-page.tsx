import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Mail, Phone } from "lucide-react";
import { getContentPage } from "../_data/pages";
import { getCmsPage } from "../_data/pages-server";
import { NAV, type NavItem } from "../_data/navigation";
import { COMPANY } from "../_data/catalog";
import { clampDesc, seoTitle } from "../_lib/seo";
import { PageBody } from "./page-body";

/** Metadata-Helfer für eine übernommene Originalseite. */
export function contentMetadata(slug: string): Metadata {
  const page = getContentPage(slug);
  if (!page) return {};
  return {
    title: seoTitle(page.metaTitle || page.title),
    description: clampDesc(page.metaDescription || page.body.replace(/^[#!|-].*$/gm, "").slice(0, 300)),
    alternates: { canonical: `/bit/${slug}` },
  };
}

/** Menügruppe (Elternpunkt + Geschwisterseiten) zu einem Pfad ermitteln. */
function sectionFor(href: string): NavItem | undefined {
  return NAV.find((item) => item.children?.some((c) => c.href === href));
}

/**
 * Trennt den ersten echten Absatz als Einleitung ab – er wird im Kopfbereich
 * größer gesetzt, der Rest bleibt Fließtext.
 */
function splitLead(
  body: string,
  title: string,
): { subtitle: string; lead: string; rest: string } {
  const lines = body.split("\n");
  let i = 0;
  const next = () => {
    while (i < lines.length && !(lines[i] ?? "").trim()) i++;
    return (lines[i] ?? "").trim();
  };

  let subtitle = "";
  // Führende Überschrift ist auf den Originalseiten die Seitenkopfzeile –
  // sie gehört in den Kopfbereich, nicht in den Fließtext.
  const first = next();
  if (first.startsWith("## ")) {
    const t = first.slice(3).trim();
    if (t.toLowerCase() !== title.trim().toLowerCase()) subtitle = t;
    i++;
  }

  // Danach einen echten Einleitungsabsatz hochziehen (Bilder überspringen).
  let lead = "";
  const save = i;
  const cand = next();
  const isParagraph =
    cand.length > 60 &&
    !cand.startsWith("#") &&
    !cand.startsWith("-") &&
    !cand.startsWith("|") &&
    !cand.startsWith("!img");
  if (isParagraph) {
    lead = cand;
    i++;
  } else {
    i = save;
  }

  return { subtitle, lead, rest: lines.slice(i).join("\n").trim() };
}

/** Rendert eine übernommene Originalseite mit Kopfbereich und Bereichsnavigation. */
export async function ContentPage({
  slug,
  parent,
}: {
  slug: string;
  /** Optionale Zwischenebene für die Brotkrümel, z. B. Branchen. */
  parent?: { label: string; href: string };
}) {
  const page = await getCmsPage(slug);
  if (!page) notFound();

  const href = `/bit/${slug}`;
  const section = sectionFor(href);
  const siblings = section?.children ?? [];
  const { subtitle, lead, rest } = splitLead(page.body, page.title);
  const crumb = parent ?? (section ? { label: section.label, href: section.href } : undefined);

  return (
    <>
      {/* Brotkrümel */}
      <nav className="border-b border-slate-200 bg-white" aria-label="Brotkrümelnavigation">
        <div className="container flex flex-wrap items-center gap-1.5 py-3.5 text-sm text-slate-500">
          <Link href="/bit" className="hover:text-[#1e4a7a]">
            Start
          </Link>
          {crumb && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              <Link href={crumb.href} className="hover:text-[#1e4a7a]">
                {crumb.label}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words text-slate-900">{page.title}</span>
        </div>
      </nav>

      {/* Kopfbereich */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="bit-hero-glow" aria-hidden="true" />
        <div className="container relative py-14">
          {section && (
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">
              {section.label}
            </p>
          )}
          <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {page.title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-3xl text-lg font-medium text-[#1d4ed8]">{subtitle}</p>
          )}
          {lead && (
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{lead}</p>
          )}
        </div>
      </section>

      <div className="container grid gap-10 py-12 lg:grid-cols-[240px_1fr] lg:gap-14">
        {/* Bereichsnavigation */}
        {siblings.length > 1 ? (
          <aside className="lg:sticky lg:top-36 lg:self-start">
            <nav
              className="rounded-2xl border border-slate-200 bg-white p-4"
              aria-label={`Weitere Seiten in ${section?.label}`}
            >
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                In diesem Bereich
              </p>
              <ul className="space-y-0.5">
                {siblings.map((s) => {
                  const current = s.href === href;
                  return (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        aria-current={current ? "page" : undefined}
                        className={`block rounded-lg px-2 py-2 text-sm leading-snug transition-colors ${
                          current
                            ? "bg-[#1e4a7a]/10 font-semibold text-[#1e4a7a]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-[#1e4a7a]"
                        }`}
                      >
                        {s.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}

        {/* Inhalt */}
        <div className="min-w-0">
          <PageBody body={rest} />

          {/* Abschluss-CTA */}
          <div className="mt-14 rounded-3xl bg-[#0f2742] px-8 py-10">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Fragen zu diesem Thema?
            </h2>
            <p className="mt-2 max-w-xl text-slate-300">
              Wir beraten Sie technisch fundiert und lösungsorientiert – rufen Sie an oder
              stellen Sie Ihre Anfrage direkt aus dem Sortiment zusammen.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bit/produkte"
                className="inline-flex items-center gap-2 rounded-xl bg-[#38bdf8] px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
              >
                Zum Sortiment <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {COMPANY.phone}
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Mail className="h-4 w-4" aria-hidden="true" /> E-Mail schreiben
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
