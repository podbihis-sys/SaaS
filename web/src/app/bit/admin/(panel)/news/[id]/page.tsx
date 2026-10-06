import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Trash2 } from "lucide-react";
import { queryOne, execute } from "@/app/bit/_lib/db";
import { NewsForm } from "@/app/bit/admin/_components/news-form";
import type { NewsInput } from "@/app/bit/admin/_actions";
import { NEWS_EN } from "@/app/bit/_data/news-en";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  published_at: string | null;
  image_path: string | null;
  image_alt: string | null;
  status: "draft" | "published";
  title_en: string | null;
  excerpt_en: string | null;
  body_en: string | null;
}

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await queryOne<Row>(
    "SELECT id,slug,title,excerpt,body,published_at,image_path,image_alt,status,title_en,excerpt_en,body_en FROM bit_news WHERE id = ? LIMIT 1",
    [id],
  );
  if (!row) notFound();

  const initial: NewsInput = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    // Leere EN-Felder mit der mitgelieferten Übersetzung vorbelegen – beim
    // Speichern wandert sie in die Datenbank und ist dann im CMS pflegbar.
    title_en: row.title_en ?? NEWS_EN[row.slug]?.title ?? "",
    excerpt_en: row.excerpt_en ?? NEWS_EN[row.slug]?.excerpt ?? "",
    body_en: row.body_en ?? NEWS_EN[row.slug]?.body ?? "",
    published_at: row.published_at ?? "",
    image_path: row.image_path ?? "",
    image_alt: row.image_alt ?? "",
    status: row.status,
  };

  async function handleDelete() {
    "use server";
    await execute("DELETE FROM bit_news WHERE id = ?", [id]);
    revalidatePath("/bit/admin/news");
    revalidatePath("/bit/news");
    redirect("/bit/admin/news");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Beitrag bearbeiten</h1>
        <form action={handleDelete}>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Löschen
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <NewsForm initial={initial} />
      </div>
    </div>
  );
}
