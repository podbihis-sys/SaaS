import type { DueStatus } from "@/lib/due";

const VARIANTS: Record<DueStatus | "retired", { label: string; className: string }> = {
  overdue: { label: "Überfällig", className: "bg-red-100 text-red-800 border-red-200" },
  due_30: { label: "Fällig ≤ 30 Tage", className: "bg-amber-100 text-amber-800 border-amber-200" },
  due_60: { label: "Fällig ≤ 60 Tage", className: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  ok: { label: "OK", className: "bg-green-100 text-green-800 border-green-200" },
  retired: { label: "Stillgelegt", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function StatusBadge({ status }: { status: DueStatus | "retired" }) {
  const variant = VARIANTS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variant.className}`}
    >
      {variant.label}
    </span>
  );
}
