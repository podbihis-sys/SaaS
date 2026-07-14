export const locales = ["de", "en", "hr", "bs", "sr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  hr: "Hrvatski",
  bs: "Bosanski",
  sr: "Srpski",
};

export const localeFlags: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  hr: "🇭🇷",
  bs: "🇧🇦",
  sr: "🇷🇸",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
