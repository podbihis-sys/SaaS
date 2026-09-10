"use client";

import { Search, X } from "lucide-react";

const STRINGS = {
  de: {
    label: "Produkte durchsuchen",
    placeholder: "Produkt, Typ, Material, Eigenschaft oder Größe … z. B. BP 125, PTFE, 3:1, 6,4 mm",
    clear: "Suche löschen",
  },
  en: {
    label: "Search products",
    placeholder: "Product, type, material, property or size … e.g. BP 125, PTFE, 3:1, 6.4 mm",
    clear: "Clear search",
  },
} as const;

/** Suchfeld der Produktübersicht (DE/EN). */
export function ProductSearchBox({
  value,
  onChange,
  locale = "de",
}: {
  value: string;
  onChange: (value: string) => void;
  locale?: "de" | "en";
}) {
  const t = STRINGS[locale];
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t.label}
        placeholder={t.placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-12 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#1e4a7a] focus:outline-none focus:ring-2 focus:ring-[#1e4a7a]/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t.clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
