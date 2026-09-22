import { PRODUCT_NAMES } from "../_data/product-names";
import { colorEn, numEn } from "../_data/terms-en";
import type { CartItem } from "./cart";

/**
 * Warenkorb-Position in der Sprache der aktuellen Seite anzeigen – unabhängig
 * davon, auf welcher Sprachseite (und wann) der Artikel hinzugefügt wurde.
 * Der gespeicherte Datensatz bleibt unverändert; nur die Anzeige wechselt.
 */
export function displayCartItem(
  item: CartItem,
  locale: "de" | "en",
): { name: string; size: string; color?: string } {
  const names = PRODUCT_NAMES[item.slug];
  // Die Typenbezeichnung („3,0/1,5“) ist eine Herstellerangabe und bleibt unverändert.
  const [dim = "", ...typ] = item.size.split(/\s·\s(?:Typ|Type)\s/);
  const typSuffix = typ.length ? typ.join(" ") : "";
  if (locale === "en") {
    return {
      name: names?.en || item.name,
      size: typSuffix ? `${numEn(dim)} · Type ${typSuffix}` : numEn(dim),
      color: item.color ? colorEn(item.color) : undefined,
    };
  }
  const dimDe = dim.replace(/(\d)\.(\d)/g, "$1,$2");
  return {
    name: names?.de || item.name,
    size: typSuffix ? `${dimDe} · Typ ${typSuffix}` : dimDe,
    color: item.color ? colorDe(item.color) : undefined,
  };
}

const COLOR_DE: Record<string, string> = {
  Black: "Schwarz", Red: "Rot", White: "Weiß", Blue: "Blau", Yellow: "Gelb", Green: "Grün",
  Transparent: "Transparent", Brown: "Braun", Grey: "Grau", Orange: "Orange", Violet: "Violett",
  Natural: "Natur", Clear: "Klar", Silver: "Silber",
};

function colorDe(color: string): string {
  return COLOR_DE[color] ?? color;
}
