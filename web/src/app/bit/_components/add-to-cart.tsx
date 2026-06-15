"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "../_data/catalog";
import { useCart } from "../_lib/cart";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>(product.colors?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!size) {
      setError(true);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      category: product.category,
      size,
      color: product.colors ? color : undefined,
      unit: product.unit,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="relative overflow-hidden rounded-[1.4rem] bg-white p-6 shadow-[0_0_0_1px_rgba(15,39,66,0.08)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#f59e0b]/10 blur-2xl" />

      {/* Größe – Pflichtauswahl */}
      <div className="relative">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>Größe wählen</span>
          <span className="text-xs font-normal text-slate-500">erforderlich</span>
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                setError(false);
              }}
              className={`bit-pill rounded-full border px-3.5 py-2 text-sm font-medium ${
                size === s
                  ? "border-[#1e4a7a] bg-[#1e4a7a] text-white shadow-md shadow-[#1e4a7a]/25"
                  : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-2 animate-[bit-pulse_0.4s] text-sm font-medium text-red-600">
            Bitte wählen Sie zuerst eine Größe aus.
          </p>
        )}
      </div>

      {/* Farbe */}
      {product.colors && product.colors.length > 0 && (
        <div className="relative mt-5">
          <label className="text-sm font-semibold text-slate-900">Ausführung</label>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`bit-pill rounded-full border px-3.5 py-2 text-sm font-medium ${
                  color === c
                    ? "border-[#1e4a7a] bg-white text-[#1e4a7a] ring-1 ring-[#1e4a7a]"
                    : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menge */}
      <div className="relative mt-5">
        <label className="text-sm font-semibold text-slate-900">
          Menge <span className="font-normal text-slate-500">({product.unit})</span>
        </label>
        <div className="mt-2.5 inline-flex items-center rounded-full border border-slate-300 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Weniger"
            className="rounded-l-full px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1e4a7a]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
            className="w-16 border-x border-slate-200 py-2 text-center text-sm font-medium text-slate-900 outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Mehr"
            className="rounded-r-full px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1e4a7a]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className={`bit-btn relative mt-6 w-full justify-center py-4 text-base ${
          added ? "bg-green-600 text-white" : "bit-btn-primary"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            <span>Zum Warenkorb hinzugefügt</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            <span>In den Warenkorb</span>
          </>
        )}
      </button>
      <p className="relative mt-3 text-center text-xs text-slate-500">
        Unverbindliche Anfrage · individuelles Angebot innerhalb von 24 Stunden
      </p>
    </div>
  );
}
