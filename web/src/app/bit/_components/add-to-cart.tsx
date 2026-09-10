"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "../_data/catalog";
import { getRolls } from "../_data/rolls";
import { getPacks } from "../_data/packs";
import { useCart } from "../_lib/cart";

const STRINGS = {
  de: {
    chooseSize: "Größe wählen", required: "erforderlich",
    sizeError: "Bitte wählen Sie zuerst eine Größe aus.",
    finish: "Ausführung", quantity: "Menge", total: "gesamt",
    laengenHint: "Lieferung als Längenware – jede Größe wird in Längen á 1,22 m geliefert.",
    rollenHint: "Lieferung nur in ganzen Rollen – die Meterzahl je Rolle hängt vom Durchmesser ab.",
    gebindeHint: "Lieferung nur in ganzen Gebinden – die Stückzahl je Gebinde hängt von der Größe ab.",
    auchAlsLaenge: "Jede Größe ist ebenfalls als Länge mit 1,22 m erhältlich – vermerken Sie den Wunsch einfach in Ihrer Anfrage.",
    added: "Zum Warenkorb hinzugefügt", add: "In den Warenkorb",
    addedStatus: "wurde zum Warenkorb hinzugefügt.",
    note: "Unverbindliche Anfrage · individuelles Angebot innerhalb von 24 Stunden",
    less: "Weniger", more: "Mehr", qty: "Menge", whole: "ganze",
    bundle: { laenge: "Länge", rolle: "Rolle", gebinde: "Gebinde" },
    bundlePl: { laenge: "Längen", rolle: "Rollen", gebinde: "Gebinde" },
    stueck: "Stück",
  },
  en: {
    chooseSize: "Choose a size", required: "required",
    sizeError: "Please choose a size first.",
    finish: "Colour / version", quantity: "Quantity", total: "in total",
    laengenHint: "Supplied as fixed lengths – every size ships in lengths of 1.22 m.",
    rollenHint: "Supplied in whole rolls only – metres per roll depend on the diameter.",
    gebindeHint: "Supplied in whole packs only – pieces per pack depend on the size.",
    auchAlsLaenge: "Every size is also available as a 1.22 m length – simply mention it in your inquiry.",
    added: "Added to cart", add: "Add to cart",
    addedStatus: "was added to the cart.",
    note: "Non-binding inquiry · individual quote within 24 hours",
    less: "Less", more: "More", qty: "Quantity", whole: "whole",
    bundle: { laenge: "Length", rolle: "Roll", gebinde: "Pack" },
    bundlePl: { laenge: "lengths", rolle: "rolls", gebinde: "packs" },
    stueck: "pcs",
  },
} as const;

export function AddToCart({
  product,
  locale = "de",
}: {
  product: Product;
  locale?: "de" | "en";
}) {
  const t = STRINGS[locale];
  const { addItem } = useCart();
  const rolls = getRolls(product.slug);
  const packs = !rolls ? getPacks(product.slug) : undefined;
  // VPE-Art: im CMS gepflegt; ohne Angabe aus der Größentabelle abgeleitet.
  const laengenware =
    product.vpeType === "laenge" ||
    (!product.vpeType && (rolls?.every((r) => r.vpe.includes("1,22")) ?? false));
  // Rollenware, die es zusätzlich als 1,22-m-Länge gibt.
  const auchAlsLaenge = product.vpeType === "rolle_laenge";
  // Längenware ohne eigene Größentabelle (z. B. PTFE 400): Größenliste nutzen.
  const laengenOhneTabelle = laengenware && !rolls;

  // Einheitliche Variantenliste für Rollen-, Längen- bzw. Gebindeware.
  const variantList = rolls
    ? rolls.map((r) => ({
        label: r.label,
        amount: laengenware && r.vpe.includes("1,22") ? 1.22 : r.metersPerRoll,
        vpe: r.vpe,
        typ: r.typ,
      }))
    : laengenOhneTabelle
      ? product.sizes.map((s) => ({
          label: s,
          amount: 1.22,
          vpe: "1,22 m",
          typ: undefined as string | undefined,
        }))
      : packs
        ? packs.map((p) => ({
            label: p.label,
            amount: p.stueckPerPack,
            vpe: p.vpe,
            typ: p.typ,
          }))
        : null;
  const meterware = rolls != null || laengenOhneTabelle;
  const amountUnit = meterware ? "m" : t.stueck;
  const bundle = meterware ? (laengenware ? t.bundle.laenge : t.bundle.rolle) : t.bundle.gebinde;
  const bundlePl = meterware
    ? (laengenware ? t.bundlePl.laenge : t.bundlePl.rolle)
    : t.bundlePl.gebinde;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "en" ? "en-GB" : "de-DE", { maximumFractionDigits: 2 });

  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>(product.colors?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const selected = variantList?.find((v) => v.label === size);
  const unit = variantList ? bundle : product.unit;

  function handleAdd() {
    if (!size) {
      setError(true);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      code: product.code,
      category: product.category,
      // Typenbezeichnung mit in die Anfrage übernehmen.
      size: selected?.typ ? `${size} · ${locale === "en" ? "Type" : "Typ"} ${selected.typ}` : size,
      color: product.colors ? color : undefined,
      unit,
      quantity,
      metersPerRoll: meterware ? selected?.amount : undefined,
      unitsPerPack: packs ? selected?.amount : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="relative overflow-hidden rounded-[1.4rem] bg-white p-6 shadow-[0_0_0_1px_rgba(15,39,66,0.08)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#38bdf8]/10 blur-2xl" />

      {/* Größe – Pflichtauswahl */}
      <div className="relative">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>{t.chooseSize}</span>
          <span className="text-xs font-normal text-slate-500">{t.required}</span>
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {variantList
            ? variantList.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => {
                    setSize(v.label);
                    setError(false);
                  }}
                  className={`bit-pill flex flex-col items-center rounded-2xl border px-3.5 py-2 text-sm font-medium ${
                    size === v.label
                      ? "border-[#1e4a7a] bg-[#1e4a7a] text-white shadow-md shadow-[#1e4a7a]/25"
                      : "border-slate-300 bg-white text-slate-700 hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
                  }`}
                >
                  <span>{v.label}</span>
                  {/* Typenbezeichnung des Herstellers (Kundenvorgabe) */}
                  {v.typ && (
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        size === v.label ? "text-white" : "text-[#1e4a7a]"
                      }`}
                    >
                      {v.typ}
                    </span>
                  )}
                  <span className={`text-[11px] ${size === v.label ? "text-white/80" : "text-slate-500"}`}>
                    {meterware ? `${v.vpe} / ${bundle}` : `${v.amount} ${amountUnit} / ${bundle}`}
                  </span>
                </button>
              ))
            : product.sizes.map((s) => (
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
          <p role="alert" className="mt-2 animate-[bit-pulse_0.4s] text-sm font-medium text-red-700">
            {t.sizeError}
          </p>
        )}
      </div>

      {/* Farbe */}
      {product.colors && product.colors.length > 0 && (
        <div className="relative mt-5">
          <label className="text-sm font-semibold text-slate-900">{t.finish}</label>
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
          {t.qty}{" "}
          <span className="font-normal text-slate-500">
            ({variantList ? `${t.whole} ${bundlePl}` : product.unit})
          </span>
        </label>
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-slate-300 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label={t.less}
              className="rounded-l-full px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1e4a7a]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              step={1}
              aria-label={t.qty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
              className="w-16 border-x border-slate-200 py-2 text-center text-sm font-medium text-slate-900 outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label={t.more}
              className="rounded-r-full px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#1e4a7a]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {variantList && selected && (
            <span className="text-sm text-slate-600">
              = <span className="font-semibold text-slate-900">{fmt(quantity * selected.amount)} {amountUnit}</span>{" "}
              {t.total} ({quantity} {quantity === 1 ? bundle : bundlePl} × {fmt(selected.amount)} {amountUnit})
            </span>
          )}
        </div>
        {variantList && (
          <p className="mt-2 text-xs text-slate-500">
            {meterware ? (laengenware ? t.laengenHint : t.rollenHint) : t.gebindeHint}
          </p>
        )}
        {auchAlsLaenge && (
          <p className="mt-1 text-xs text-slate-500">
            {t.auchAlsLaenge}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className={`bit-btn relative mt-6 w-full justify-center py-4 text-base ${
          added ? "bg-green-700 text-white" : "bit-btn-primary"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" aria-hidden="true" />
            <span>{t.added}</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <span>{t.add}</span>
          </>
        )}
      </button>
      {/* Statusmeldung für Screenreader (WCAG 4.1.3 Status Messages) */}
      <p role="status" aria-live="polite" className="bit-sr-only">
        {added ? `${product.name} ${t.addedStatus}` : ""}
      </p>
      <p className="relative mt-3 text-center text-xs text-slate-500">
        {t.note}
      </p>
    </div>
  );
}
