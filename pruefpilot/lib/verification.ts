import { dueStatus, todayIso } from "./due";
import type { InspectionResult } from "./inspections";

export interface VerificationPayload {
  name: string;
  category_id: string;
  status: "active" | "retired";
  next_due_date: string;
  last_inspected_at: string | null;
  last_result: InspectionResult | null;
  last_inspector: string | null;
}

export type Verdict = "valid" | "expired" | "failed" | "none" | "retired";

/** Eindeutiges Gültigkeits-Verdikt für die QR-Verifikation. */
export function verdictFor(payload: VerificationPayload, today: string = todayIso()): Verdict {
  if (payload.status === "retired") return "retired";
  if (!payload.last_inspected_at || !payload.last_result) return "none";
  if (payload.last_result === "failed") return "failed";
  return dueStatus(payload.next_due_date, today) === "overdue" ? "expired" : "valid";
}

export interface VerdictMeta {
  label: string;
  hint: string;
  tone: "valid" | "invalid" | "neutral";
}

export function verdictMeta(verdict: Verdict): VerdictMeta {
  switch (verdict) {
    case "valid":
      return { label: "Gültig", hint: "Prüfung aktuell — Gerät freigegeben.", tone: "valid" };
    case "expired":
      return { label: "Abgelaufen", hint: "Prüffrist überschritten — Prüfung erforderlich.", tone: "invalid" };
    case "failed":
      return { label: "Nicht bestanden", hint: "Letzte Prüfung nicht bestanden — nicht verwenden.", tone: "invalid" };
    case "retired":
      return { label: "Stillgelegt", hint: "Gerät ist außer Betrieb.", tone: "neutral" };
    case "none":
      return { label: "Keine Prüfung", hint: "Für dieses Gerät ist noch keine Prüfung dokumentiert.", tone: "neutral" };
  }
}
