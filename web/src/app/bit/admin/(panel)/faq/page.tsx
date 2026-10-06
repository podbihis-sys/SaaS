import { query } from "@/app/bit/_lib/db";
import { FaqEditor } from "../../_components/faq-editor";
import type { FaqListInput } from "../../_actions";

export const dynamic = "force-dynamic";

export default async function FaqAdmin() {
  let data: { group_name: string; question: string; answer: string }[] = [];
  try {
    data = await query(
      "SELECT group_name,question,answer FROM bit_faq ORDER BY sort_order",
    );
  } catch {
    data = [];
  }
  const rows: FaqListInput = data.map((r) => ({
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
