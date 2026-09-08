import { createClient } from "@/app/bit/_lib/supabase-server";
import { FaqEditor } from "../../_components/faq-editor";
import type { FaqListInput } from "../../_actions";

export const dynamic = "force-dynamic";

export default async function FaqAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bit_faq")
    .select("group_name,question,answer,sort_order")
    .order("sort_order");
  const rows: FaqListInput = (data ?? []).map((r) => ({
    group_name: r.group_name,
    question: r.question,
    answer: r.answer,
  }));
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">FAQ</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fragen und Antworten für /bit/faq – Reihenfolge per Pfeiltasten, dann „Alles speichern“.
      </p>
      <div className="mt-6">
        <FaqEditor initial={rows} />
      </div>
    </>
  );
}
