import { formatPriceInput } from "@/features/admin/price";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

const locales = ["pl", "uk", "en"] as const;
const accents = ["bone", "teriyaki", "chili"] as const;

const fieldClass =
  "mt-2 w-full border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base outline-none focus-visible:border-ink-800";

export function ProductForm({
  locale,
  dict,
  action,
  error,
  product,
}: {
  locale: Locale;
  dict: Dictionary;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  product?: {
    id: string;
    slug: string;
    accent: string;
    sortOrder: number;
    published: boolean;
    priceMinor: number | null;
    translations: { locale: string; name: string; profile: string }[];
  };
}) {
  const message =
    error === "price" ? dict.admin.errors.price : error === "slug" ? dict.admin.errors.slug : error === "fields" ? dict.admin.errors.fields : null;

  return (
    <form action={action} className="grid max-w-3xl gap-8">
      <input type="hidden" name="locale" value={locale} />
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}
      {message ? <p className="text-sm text-chili">{message}</p> : null}
      {error === "saved" ? <p className="text-sm">{dict.admin.saved}</p> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        {product ? (
          <p className="text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em]">{dict.admin.slug}</span>
            <span className="mt-2 block">{product.slug}</span>
          </p>
        ) : (
          <label className="text-xs font-semibold uppercase tracking-[0.16em]">
            {dict.admin.slug}
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={fieldClass} />
          </label>
        )}
        <label className="text-xs font-semibold uppercase tracking-[0.16em]">
          {dict.admin.accent}
          <select name="accent" defaultValue={product?.accent ?? "bone"} className={fieldClass}>
            {accents.map((accent) => (
              <option key={accent} value={accent}>
                {accent}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em]">
          {dict.admin.sort}
          <input name="sortOrder" type="number" min={0} max={999} required defaultValue={product?.sortOrder ?? 0} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em]">
          {dict.admin.price}
          <input name="price" inputMode="decimal" defaultValue={formatPriceInput(product?.priceMinor ?? null)} placeholder={dict.price.comingSoon} className={fieldClass} />
          <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-text-dark/70">{dict.admin.priceHint}</span>
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? false} className="h-4 w-4 accent-ink-950" />
        {dict.admin.published}
      </label>
      {locales.map((item) => {
        const copy = product?.translations.find((translation) => translation.locale === item);
        return (
          <fieldset key={item} className="grid gap-4 border border-ink-800/10 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.16em]">{item}</legend>
            <label className="text-xs font-semibold uppercase tracking-[0.16em]">
              {dict.auth.name}
              <input name={`name-${item}`} required defaultValue={copy?.name ?? ""} className={fieldClass} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.16em]">
              {dict.admin.profile}
              <textarea name={`profile-${item}`} required rows={4} defaultValue={copy?.profile ?? ""} className={fieldClass} />
            </label>
          </fieldset>
        );
      })}
      <button type="submit" className="w-fit bg-ink-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-light">
        {dict.admin.save}
      </button>
    </form>
  );
}
