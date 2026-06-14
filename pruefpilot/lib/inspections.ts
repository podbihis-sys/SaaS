export const INSPECTION_RESULT_VALUES = ["passed", "passed_with_defects", "failed"] as const;

export type InspectionResult = (typeof INSPECTION_RESULT_VALUES)[number];

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  passed: "Bestanden",
  passed_with_defects: "Bestanden mit Mängeln",
  failed: "Durchgefallen",
};

export function inspectionResultLabel(value: string): string {
  return (INSPECTION_RESULT_LABELS as Record<string, string>)[value] ?? value;
}
