import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BlogContent from "@/components/BlogContent";
import { posts, getPost, sortedPosts } from "@/lib/blog";
import { blogImage } from "@/lib/photos";
import { JsonLd, breadcrumbJsonLd, articleJsonLd } from "@/lib/jsonld";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = sortedPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <PageHeader
        title={post.title}
        subtitle={post.subtitle}
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <article className="container-content py-16">
        <div className="mx-auto max-w-3xl">
          {blogImage[post.slug] && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-organic">
              <Image
                src={blogImage[post.slug]}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}
          <time className="text-sm text-anthracite-500" dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <div className="mt-6">
            <BlogContent blocks={post.blocks} />
          </div>

          <div className="mt-12 rounded-organic bg-moss-50 p-8 text-center">
            <p className="font-display text-xl text-anthracite-900">
              Haben wir Ihr Interesse geweckt?
            </p>
            <p className="mt-2 text-anthracite-600">
              Dann melden Sie sich gerne über unser Kontaktformular!
            </p>
            <Link href="/kontakt" className="btn-primary mt-5">
              Jetzt Beratung anfragen
            </Link>
          </div>
        </div>
      </article>

      <section className="bg-white py-16">
        <div className="container-content">
          <h2 className="text-2xl sm:text-3xl">Weitere Beiträge</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <article
                key={p.slug}
                className="rounded-organic border border-moss-100 bg-sand p-7"
              >
                <h3 className="text-xl">
                  <Link href={`/blog/${p.slug}`} className="hover:text-moss-700">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-3 text-anthracite-600">{p.excerpt}</p>
                <Link
                  href={`/blog/${p.slug}`}
                  className="mt-4 inline-block font-medium text-moss-700 hover:text-moss-800"
                >
                  Weiterlesen →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
