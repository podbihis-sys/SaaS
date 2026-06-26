import Link from "next/link";

type Crumb = { name: string; path: string };

/** Wiederverwendbarer Seitenkopf mit Breadcrumb für Unterseiten. */
export default function PageHeader({
  title,
  subtitle,
  crumbs,
}: {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="bg-moss-50/60">
      <div className="container-content py-12 sm:py-16">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Brotkrumen" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-anthracite-500">
              {crumbs.map((c, i) => (
                <li key={c.path} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link href={c.path} className="hover:text-moss-700">
                      {c.name}
                    </Link>
                  ) : (
                    <span className="text-anthracite-700">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-anthracite-600">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
