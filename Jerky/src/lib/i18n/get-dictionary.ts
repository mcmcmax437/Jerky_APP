import en from "../../../messages/en.json";
import pl from "../../../messages/pl.json";
import uk from "../../../messages/uk.json";
import type { Locale } from "./locales";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { pl, uk, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
