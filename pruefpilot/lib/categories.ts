// Spiegel von supabase/seed.sql — bei Änderungen beide Stellen gemeinsam pflegen.
// Intervalle sind EMPFEHLUNGEN (DGUV V3 risikoabhängig 6–24 Monate) und je Gerät anpassbar.
export interface DeviceCategory {
  id: string;
  nameDe: string;
  legalBasis: string;
  defaultIntervalMonths: number;
  sort: number;
}

export const DEVICE_CATEGORIES = [
  { id: "dguv_v3_portable", nameDe: "Elektrogerät (ortsveränderlich)", legalBasis: "DGUV Vorschrift 3 / VDE 0701-0702", defaultIntervalMonths: 12, sort: 10 },
  { id: "dguv_v3_fixed", nameDe: "Elektroanlage (ortsfest)", legalBasis: "DGUV Vorschrift 3 / VDE 0105-100", defaultIntervalMonths: 48, sort: 20 },
  { id: "ladder", nameDe: "Leiter / Tritt", legalBasis: "DGUV Information 208-016", defaultIntervalMonths: 12, sort: 30 },
  { id: "fire_extinguisher", nameDe: "Feuerlöscher", legalBasis: "DIN 14406-4 / ASR A2.2", defaultIntervalMonths: 24, sort: 40 },
  { id: "first_aid", nameDe: "Erste-Hilfe-Material", legalBasis: "DGUV Vorschrift 1 / DIN 13157", defaultIntervalMonths: 12, sort: 50 },
  { id: "uvv_vehicle", nameDe: "Fahrzeug (UVV)", legalBasis: "DGUV Vorschrift 70", defaultIntervalMonths: 12, sort: 60 },
  { id: "uvv_forklift", nameDe: "Flurförderzeug (UVV)", legalBasis: "DGUV Vorschrift 68", defaultIntervalMonths: 12, sort: 70 },
] as const satisfies readonly DeviceCategory[];

export const CATEGORY_IDS = DEVICE_CATEGORIES.map((c) => c.id) as [string, ...string[]];

export type CategoryId = (typeof DEVICE_CATEGORIES)[number]["id"];

const byId = new Map<string, DeviceCategory>(DEVICE_CATEGORIES.map((c) => [c.id, c]));

export function categoryById(id: string): DeviceCategory | undefined {
  return byId.get(id);
}

export function categoryName(id: string): string {
  return byId.get(id)?.nameDe ?? id;
}
