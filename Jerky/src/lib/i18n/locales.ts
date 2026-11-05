export const locales = ["pl", "uk", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pl";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeTag(locale: Locale): string {
  if (locale === "pl") return "pl-PL";
  if (locale === "uk") return "uk-UA";
  return "en-GB";
}
