import { notFound } from "next/navigation";
import { queryOne, parseJsonColumn } from "@/app/bit/_lib/db";
import { JobForm } from "../../../_components/job-form";

export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  slug: string;
  title: string;
  intro: string;
  body: string;
  tasks_title: string;
  tasks: unknown;
  closing: string;
  title_en: string | null;
  intro_en: string | null;
  body_en: string | null;
  tasks_title_en: string | null;
  tasks_en: unknown;
  closing_en: string | null;
  sort_order: number;
  status: "draft" | "published";
}

export default async function StelleBearbeiten({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await queryOne<JobRow>(
    "SELECT id,slug,title,intro,body,tasks_title,tasks,closing,title_en,intro_en,body_en,tasks_title_en,tasks_en,closing_en,sort_order,status FROM bit_jobs WHERE id = ? LIMIT 1",
    [id],
  );
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
            tasks: parseJsonColumn<string[]>(data.tasks, []),
            closing: data.closing,
            title_en: data.title_en ?? "",
            intro_en: data.intro_en ?? "",
            body_en: data.body_en ?? "",
            tasks_title_en: data.tasks_title_en ?? "",
            tasks_en: parseJsonColumn<string[]>(data.tasks_en, []),
            closing_en: data.closing_en ?? "",
            sort_order: data.sort_order,
            status: data.status,
          }}
        />
      </div>
    </>
  );
}
