import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getCmsNewsPost, getCmsNews, localizeNews } from "../../../_data/news-server";
import { NEWS } from "../../../_data/news";
import { COMPANY } from "../../../_data/catalog";
import { clampText, clampDesc } from "../../../_lib/seo";

/** Englische Beitragsseite – gleicher Aufbau wie /bit/news/[slug]. */

export const revalidate = 300;
export const dynamicParams = true;

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

function abs(path: string): string {
  if (!path) return `${BASE}/bit/logo.png`;
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export async function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const raw = await getCmsNewsPost(slug);
  if (!raw) return { title: "News" };
  const post = localizeNews(raw, "en");
  const metaTitle = clampText(post.title, 55);
  const metaDesc = clampDesc(post.excerpt);
  return {
    title: { absolute: `${metaTitle} · BIT` },
    description: metaDesc,
    alternates: { canonical: `/bit/en/news/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: metaDesc,
      publishedTime: post.date || undefined,
      images: post.image ? [{ url: post.image, alt: post.imageAlt }] : undefined,
    },
  };
}

/** Rendert den einfachen Fließtext (## Überschrift, - Punkt, Absatz). */
function NewsBody({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (bullets.length === 0) return;
    out.push(
      <ul key={key} className="my-4 space-y-2 pl-5">
        {bullets.map((b, i) => (
          <li key={i} className="list-disc leading-relaxed text-slate-700 marker:text-[#1e4a7a]">
            {b}
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  blocks.forEach((block, i) => {
    if (block.startsWith("- ")) {
      bullets.push(block.slice(2).trim());
      return;
    }
    flush(`ul-${i}`);
    if (block.startsWith("## ")) {
      out.push(
        <h2 key={i} className="mt-8 text-xl font-bold tracking-tight text-slate-900">
          {block.slice(3).trim()}
        </h2>,
      );
    } else {
      out.push(
        <p key={i} className="mt-4 leading-relaxed text-slate-700">
          {block}
        </p>,
      );
    }
  });
  flush("ul-end");
  return <>{out}</>;
}

export default async function EnglishNewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await getCmsNewsPost(slug);
  if (!raw) notFound();
  const post = localizeNews(raw, "en");

  const others = (await getCmsNews())
    .filter((n) => n.slug !== post.slug)
    .slice(0, 3)
    .map((n) => localizeNews(n, "en"));

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: [abs(post.image)],
    datePublished: post.date || undefined,
    dateModified: post.date || undefined,
    inLanguage: "en-GB",
    mainEntityOfPage: `${BASE}/bit/en/news/${post.slug}`,
    author: { "@type": "Organization", name: COMPANY.shortName },
    publisher: {
      "@type": "Organization",
      name: COMPANY.legalName,
      logo: { "@type": "ImageObject", url: `${BASE}/bit/logo.png` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <article className="container max-w-3xl py-12">
        <Link
          href="/bit/en/news"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#1e4a7a]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to overview
        </Link>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        {post.date && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <CalendarDays className="h-4 w-4" /> {fmt(post.date)}
          </p>
        )}

        {post.image && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.imageAlt} className="w-full object-contain" />
          </div>
        )}

        <div className="mt-8">
          <NewsBody body={post.body} />
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-semibold text-slate-900">Questions about this topic?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Our sales team is happy to advise you and prepare an individual quote.
          </p>
          <Link
            href="/bit/en/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Get in touch
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="container">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">More articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((n) => (
                <article
                  key={n.slug}
                  className="bit-card group relative flex flex-col overflow-hidden bg-white"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={n.image}
                      alt={n.imageAlt}
                      className="bit-card-img h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {n.date && (
                      <span className="text-xs font-medium text-slate-500">{fmt(n.date)}</span>
                    )}
                    <h3 className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">
                      <Link
                        href={`/bit/en/news/${n.slug}`}
                        className="before:absolute before:inset-0 hover:text-[#1e4a7a]"
                      >
                        {n.title}
                      </Link>
                    </h3>
                    <span className="mt-3 inline-block text-sm font-semibold text-[#1e4a7a]">Read more</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
