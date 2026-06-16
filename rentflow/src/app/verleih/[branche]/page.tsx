import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BRANCHES, getBranche } from "@/lib/seo/branches";

export const dynamicParams = false;

export function generateStaticParams() {
  return BRANCHES.map((b) => ({ branche: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ branche: string }>;
}): Promise<Metadata> {
  const { branche } = await params;
  const b = getBranche(branche);
  if (!b) return {};
  return {
    title: b.h1,
    description: b.intro,
    alternates: { canonical: `/verleih/${b.slug}` },
  };
}

export default async function BranchePage({
  params,
}: {
  params: Promise<{ branche: string }>;
}) {
  const { branche } = await params;
  const b = getBranche(branche);
  if (!b) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: b.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm font-medium text-muted-foreground">{b.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{b.h1}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{b.intro}</p>

      <div className="mt-8 flex gap-3">
        <Link href="/login">
          <Button size="lg">Kostenlos starten</Button>
        </Link>
        <Link href="/verleih-software">
          <Button size="lg" variant="outline">
            Mehr erfahren
          </Button>
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Häufige Fragen</h2>
        <dl className="mt-6 space-y-6">
          {b.faq.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="mt-14 border-t pt-6 text-sm">
        <p className="mb-2 font-medium">Weitere Branchen</p>
        <ul className="flex flex-wrap gap-3 text-muted-foreground">
          {BRANCHES.filter((x) => x.slug !== b.slug).map((x) => (
            <li key={x.slug}>
              <Link href={`/verleih/${x.slug}`} className="underline">
                {x.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
