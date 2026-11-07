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
    <p className={`font-sans text-lg font-semibold tabular-nums ${className}`}>
      {formatPrice(amountMinor, locale, comingSoon)}
    </p>
  );
}
