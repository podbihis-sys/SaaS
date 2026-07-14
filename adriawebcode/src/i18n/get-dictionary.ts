import type { Locale } from "./config";
import de, { type Dictionary } from "./dictionaries/de";
import en from "./dictionaries/en";
import hr from "./dictionaries/hr";
import bs from "./dictionaries/bs";
import sr from "./dictionaries/sr";

const dictionaries: Record<Locale, Dictionary> = { de, en, hr, bs, sr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? de;
}

export type { Dictionary };
