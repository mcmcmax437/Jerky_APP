import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";

export function Price({
  amountMinor,
  locale,
  comingSoon,
  className = "",
}: {
  amountMinor: number | null;
  locale: Locale;
  comingSoon: string;
  className?: string;
}) {
  return (
    <p className={`tabular-nums tracking-wide ${className}`}>
      {formatPrice(amountMinor, locale, comingSoon)}
    </p>
  );
}
