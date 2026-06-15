import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getCmsNewsPost, getCmsNews } from "../../_data/news-server";
import { NEWS } from "../../_data/news";
import { formatDate } from "../../_lib/format";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCmsNewsPost(slug);
  if (!post) return { title: "News" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
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

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCmsNewsPost(slug);
  if (!post) notFound();

  const others = (await getCmsNews()).filter((n) => n.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="container max-w-3xl py-12">
        <Link
          href="/bit/news"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#1e4a7a]"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </Link>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        {post.date && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400">
            <CalendarDays className="h-4 w-4" /> {formatDate(post.date)}
          </p>
        )}

        {post.image && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt={post.imageAlt} className="w-full object-cover" />
          </div>
        )}

        <div className="mt-8">
          <NewsBody body={post.body} />
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-semibold text-slate-900">Fragen zu diesem Thema?</h2>
          <p className="mt-1 text-sm text-slate-600">
            Unser Vertriebsteam berät Sie gern und erstellt Ihnen ein individuelles Angebot.
          </p>
          <Link
            href="/bit/kontakt"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1e4a7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a61]"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-14">
          <div className="container">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Weitere Beiträge</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((n) => (
                <Link
                  key={n.slug}
                  href={`/bit/news/${n.slug}`}
                  className="bit-card group flex flex-col overflow-hidden bg-white"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-t-[1.3rem] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={n.image}
                      alt={n.imageAlt}
                      className="bit-card-img h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {n.date && (
                      <span className="text-xs font-medium text-slate-400">{formatDate(n.date)}</span>
                    )}
                    <h3 className="mt-1.5 text-sm font-semibold leading-snug text-slate-900">{n.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
