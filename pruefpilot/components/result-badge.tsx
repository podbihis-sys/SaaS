import { inspectionResultLabel } from "@/lib/inspections";

const CLASSES: Record<string, string> = {
  passed: "bg-green-100 text-green-800 border-green-200",
  passed_with_defects: "bg-amber-100 text-amber-800 border-amber-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

export function ResultBadge({ result }: { result: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASSES[result] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
    >
      {inspectionResultLabel(result)}
    </span>
  );
}
