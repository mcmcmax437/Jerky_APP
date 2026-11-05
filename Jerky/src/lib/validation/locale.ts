import { z } from "zod";
import { locales, type Locale } from "@/lib/i18n/locales";

export const localeSchema = z.enum(locales);

export function parseLocale(value: string): Locale | null {
  const parsed = localeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
