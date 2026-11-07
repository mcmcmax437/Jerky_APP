import { packSizes, type PackSize } from "@/features/cart/quote";
import { formatWeight } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";

export function PackSizePicker({
  value,
  onChange,
  label,
  locale,
}: {
  value: PackSize;
  onChange: (size: PackSize) => void;
  label: string;
  locale: Locale;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {packSizes.map((size) => {
        const pressed = value === size;
        return (
          <button
            key={size}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(size)}
            className={`press h-12 rounded-xl border text-sm font-semibold tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
              pressed ? "border-[#c4a574] bg-[#c4a574]/15 text-[#f3e2cc]" : "border-white/15 text-text-light/80 hover:border-white/40"
            }`}
          >
            {formatWeight(Number(size), locale)}
          </button>
        );
      })}
    </div>
  );
}
