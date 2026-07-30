import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getContentPage } from "../_data/pages";
import { clampDesc, seoTitle } from "../_lib/seo";
import { PageBody } from "./page-body";

/** Metadata-Helfer für eine übernommene Originalseite. */
export function contentMetadata(slug: string): Metadata {
  const page = getContentPage(slug);
  if (!page) return {};
  return {
    title: seoTitle(page.metaTitle || page.title),
    description: clampDesc(page.metaDescription || page.body.slice(0, 300)),
    alternates: { canonical: `/bit/${slug}` },
  };
}

/** Rendert eine übernommene Originalseite inkl. Brotkrümelnavigation. */
export function ContentPage({
  slug,
  parent,
}: {
  slug: string;
  /** Optionale Zwischenebene für die Brotkrümel, z. B. Branchen. */
  parent?: { label: string; href: string };
}) {
  const page = getContentPage(slug);
  if (!page) notFound();

  return (
    <>
      <nav className="border-b border-slate-200 bg-slate-50" aria-label="Brotkrümelnavigation">
        <div className="container flex flex-wrap items-center gap-1.5 py-4 text-sm text-slate-500">
          <Link href="/bit" className="hover:text-[#1e4a7a]">
            Start
          </Link>
          {parent && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              <Link href={parent.href} className="hover:text-[#1e4a7a]">
                {parent.label}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words text-slate-900">{page.title}</span>
        </div>
      </nav>

      <article className="container py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {page.title}
        </h1>
        <PageBody body={page.body} />

        <div className="mt-12 flex flex-wrap gap-3 border-t border-slate-200 pt-8">
          <Link
            href="/bit/produkte"
            className="rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Zum Sortiment
          </Link>
          <Link
            href="/bit/kontakt"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Beratung anfragen
          </Link>
        </div>
      </article>
    </>
  );
}
