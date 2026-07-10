"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "../_lib/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, count } = useCart();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Fokus-Management für den modalen Drawer: Fokus hinein verschieben, mit Tab
  // einfangen (Fokus-Trap), ESC schließt, beim Schließen Fokus zurückgeben.
  useEffect(() => {
    if (!isOpen) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      restoreRef.current?.focus();
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Warenkorb"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-slate-900">
            <ShoppingCart className="h-5 w-5 text-[#1e4a7a]" />
            <h2 className="text-lg font-semibold">Warenkorb</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {count}
            </span>
          </div>
          <button
            ref={closeRef}
            onClick={closeCart}
            aria-label="Warenkorb schließen"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4a7a]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <ShoppingCart className="mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-700">Ihr Warenkorb ist leer</p>
              <p className="mt-1 text-sm">
                Stellen Sie Ihre Anfrage aus unserem Sortiment zusammen.
              </p>
              <Link
                href="/bit/produkte"
                onClick={closeCart}
                className="mt-4 rounded-lg bg-[#1e4a7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#163a61]"
              >
                Zu den Produkten
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Größe: <span className="font-medium text-slate-700">{item.size}</span>
                        {item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Entfernen"
                      className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Weniger"
                        className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        aria-label={`Menge – ${item.name}`}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value || "1", 10))
                        }
                        className="w-12 border-x border-slate-200 py-1 text-center text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1e4a7a]"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Mehr"
                        className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-right text-xs text-slate-500">
                      {item.metersPerRoll
                        ? `${item.quantity === 1 ? "Rolle" : "Rollen"} · ${item.quantity * item.metersPerRoll} m`
                        : item.unitsPerPack
                          ? `${item.quantity === 1 ? "Gebinde" : "Gebinde"} · ${item.quantity * item.unitsPerPack} Stück`
                          : item.unit}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-slate-200 px-5 py-4">
            <Link
              href="/bit/warenkorb"
              onClick={closeCart}
              className="block w-full rounded-lg bg-[#38bdf8] px-4 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-[#0ea5e9]"
            >
              Anfrage zusammenstellen
            </Link>
            <p className="mt-2 text-center text-xs text-slate-500">
              Unverbindlich · kostenfreies Angebot innerhalb von 24 h
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
