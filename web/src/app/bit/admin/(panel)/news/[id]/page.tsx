import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Trash2 } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";
import { NewsForm } from "@/app/bit/admin/_components/news-form";
import type { NewsInput } from "@/app/bit/admin/_actions";

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
}

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("bit_news").select("*").eq("id", id).maybeSingle();
  const row = data as Row | null;
  if (!row) notFound();

  const initial: NewsInput = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    published_at: row.published_at ?? "",
    image_path: row.image_path ?? "",
    image_alt: row.image_alt ?? "",
    status: row.status,
  };

  async function handleDelete() {
    "use server";
    const sb = await createClient();
    await sb.from("bit_news").delete().eq("id", id);
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
