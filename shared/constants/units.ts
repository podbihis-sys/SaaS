import type { Unit } from "../types/enums";

export const UNITS: readonly Unit[] = ["h", "m2", "m", "kg", "pcs"] as const;

export const UNIT_LABELS_DE: Record<Unit, string> = {
  h: "Stunde",
  m2: "m²",
  m: "Meter",
  kg: "Kilogramm",
  pcs: "Stück",
};

export function isUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value);
}
