import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getCmsNews } from "../../_data/news-server";
import { Reveal } from "../../_components/reveal";

/**
 * Englische News-Übersicht – gleicher Aufbau wie /bit/news. Die Beiträge
 * selbst werden im CMS auf Deutsch gepflegt und verlinken auf die
 * deutschen Beitragsseiten.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/bit/en/news" },
  title: "News",
  description:
    "News from BIT: new products, product tips and applications for heat-shrink, insulating and braided sleeves, corrugated conduits and cable ties.",
};

export default async function EnglishNewsPage() {
  const posts = await getCmsNews();

  return (
    <>
      <section className="border-b border-slate-800 bg-[#0f2742]">
        <div className="bit-page-hero container py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#38bdf8]">News</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:whitespace-nowrap lg:text-4xl">
            Learn more about us and our products
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            New products, product tips and application examples for our heat-shrink, insulating
            and braided sleeves, corrugated conduits and cable ties.
          </p>
        </div>
      </section>

      <section className="container py-16">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No articles have been published yet.
          </p>
        ) : (
          <>
            <p className="mb-8 text-sm text-slate-500">
              Our news articles are published in German.
            </p>
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
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      )}
                      <h2 className="mt-2 text-lg font-semibold leading-snug text-slate-900" lang="de">
                        <Link
                          href={`/bit/news/${post.slug}`}
                          className="before:absolute before:inset-0 hover:text-[#1e4a7a]"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600" lang="de">
                        {post.excerpt}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4a7a]">
                        Read more (German)
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
