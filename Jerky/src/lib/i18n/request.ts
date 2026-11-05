import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export async function readLocale(
  params: Promise<{ locale: string }>,
): Promise<{ locale: Locale; dict: Dictionary }> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, dict: getDictionary(locale) };
}
