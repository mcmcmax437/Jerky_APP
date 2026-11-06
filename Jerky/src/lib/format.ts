import { localeTag, type Locale } from "@/lib/i18n/locales";

export function formatPrice(
  amountMinor: number | null,
  locale: Locale,
  comingSoon: string,
): string {
  if (amountMinor == null) return comingSoon;
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "PLN",
  }).format(amountMinor / 100);
}

export function formatAmount(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "PLN",
  }).format(amount);
}

export function formatWeight(grams: number, locale: Locale): string {
  return `${new Intl.NumberFormat(localeTag(locale)).format(grams)}\u00a0g`;
}

export function formatDateTime(value: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
