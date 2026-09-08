import { notFound } from "next/navigation";
import { createClient } from "@/app/bit/_lib/supabase-server";
import { PageForm } from "../../../_components/page-form";

export const dynamic = "force-dynamic";

export default async function SeiteBearbeiten({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("bit_pages").select("*").eq("id", id).maybeSingle();
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
