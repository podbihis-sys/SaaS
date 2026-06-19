import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { c } from "../_data/content";
import { getContent } from "../_data/content-server";
import { getCmsNews } from "../_data/news-server";
import { formatDate } from "../_lib/format";
import { Reveal } from "../_components/reveal";
import { BreadcrumbLd } from "../_components/breadcrumb-ld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/bit/news" },
  title: "News",
  description:
    "Aktuelles von der BIT Bierther GmbH: Neuheiten, Produkttipps und Anwendungen rund um Schrumpf-, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder.",
};

export default async function NewsPage() {
  const content = await getContent();
  const posts = await getCmsNews();

  return (
    <>
      <BreadcrumbLd items={[{ name: "Home", path: "/bit" }, { name: "News", path: "/bit/news" }]} />
      {/* ----------------------------------------------------------------- Hero */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1e4a7a]">News</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900">
            {c(content, "news.hero.title", "Erfahren Sie mehr über uns und unsere Produkte")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            {c(
              content,
              "news.hero.intro",
              "Neuheiten, Produkttipps und Anwendungsbeispiele rund um unsere Schrumpf-, Isolier- und Geflechtschläuche, Wellrohre und Kabelbinder.",
            )}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Posts */}
      <section className="container py-16">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Aktuell sind keine Beiträge veröffentlicht.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 70} className="h-full">
                <article className="bit-card group relative flex h-full flex-col overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      className="bit-card-img h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {post.date && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.date)}
                      </span>
                    )}
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                      <Link
                        href={`/bit/news/${post.slug}`}
                        className="before:absolute before:inset-0 hover:text-[#1e4a7a]"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {post.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                      Weiterlesen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
