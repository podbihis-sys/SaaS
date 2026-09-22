import { notFound } from "next/navigation";
import { createClient } from "@/app/bit/_lib/supabase-server";
import { JobForm } from "../../../_components/job-form";

export const dynamic = "force-dynamic";

export default async function StelleBearbeiten({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("bit_jobs").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Stelle bearbeiten</h1>
      <div className="mt-6">
        <JobForm
          initial={{
            id: data.id,
            slug: data.slug,
            title: data.title,
            intro: data.intro,
            body: data.body,
            tasks_title: data.tasks_title,
            tasks: data.tasks ?? [],
            closing: data.closing,
            title_en: data.title_en ?? "",
            intro_en: data.intro_en ?? "",
            body_en: data.body_en ?? "",
            tasks_title_en: data.tasks_title_en ?? "",
            tasks_en: data.tasks_en ?? [],
            closing_en: data.closing_en ?? "",
            sort_order: data.sort_order,
            status: data.status,
          }}
        />
      </div>
    </>
  );
}
