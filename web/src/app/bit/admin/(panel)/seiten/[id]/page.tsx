import { notFound } from "next/navigation";
import { queryOne } from "@/app/bit/_lib/db";
import { PageForm } from "../../../_components/page-form";

export const dynamic = "force-dynamic";

interface PageRow {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  body: string;
  status: "draft" | "published";
}

export default async function SeiteBearbeiten({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await queryOne<PageRow>(
    "SELECT id,slug,title,meta_title,meta_description,body,status FROM bit_pages WHERE id = ? LIMIT 1",
    [id],
  );
  if (!data) notFound();
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Seite bearbeiten</h1>
      <p className="mt-1 text-sm text-slate-500">/bit/{data.slug}</p>
      <div className="mt-6">
        <PageForm
          initial={{
            id: data.id,
            slug: data.slug,
            title: data.title,
            meta_title: data.meta_title ?? "",
            meta_description: data.meta_description ?? "",
            body: data.body,
            status: data.status,
          }}
        />
      </div>
    </>
  );
}
