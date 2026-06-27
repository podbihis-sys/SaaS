import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { sortedPosts } from "@/lib/blog";
import { blogImage } from "@/lib/photos";
import { JsonLd, breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Blog – Wissen rund um den Naturgarten",
  description:
    "Praxiswissen rund um naturnahe Gärten: Pflege, Pflanzenauswahl, Frühjahrsarbeiten und nachhaltige Gartengestaltung in der Region Bad Münstereifel & Euskirchen.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Startseite", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <PageHeader
        title="Blog"
        subtitle="Gedanken, Praxiswissen und Beobachtungen aus unserer täglichen Arbeit im naturnahen Garten."
        crumbs={[
          { name: "Startseite", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <section className="container-content py-16">
        <div className="grid gap-8">
          {sortedPosts.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 80}>
              <article className="grid gap-6 overflow-hidden rounded-organic border border-moss-100 bg-white sm:grid-cols-[260px_1fr] sm:items-stretch">
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block aspect-[3/2] sm:aspect-auto"
                >
                  <Image
                    src={blogImage[post.slug]}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 260px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-col justify-center p-7 sm:pl-0">
                  <time
                    className="text-sm text-anthracite-500"
                    dateTime={post.date}
                  >
                    {new Date(post.date).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="mt-2 text-2xl">
                    <Link href={`/blog/${post.slug}`} className="hover:text-moss-700">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-1 font-display text-moss-700">
                    {post.subtitle}
                  </p>
                  <p className="mt-3 text-anthracite-600">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 font-medium text-moss-700 hover:text-moss-800"
                  >
                    Weiterlesen →
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
