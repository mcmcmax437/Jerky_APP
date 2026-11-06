import { formatPriceInput } from "@/features/admin/price";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

const locales = ["pl", "uk", "en"] as const;
const accents = ["bone", "teriyaki", "chili"] as const;

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8d8278] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

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
    netWeightG: number;
    photo: string | null;
    translations: { locale: string; name: string; card: string | null; profile: string }[];
  };
}) {
  const message =
    error === "price"
      ? dict.admin.errors.price
      : error === "slug"
        ? dict.admin.errors.slug
        : error === "fields"
          ? dict.admin.errors.fields
          : error === "photo"
            ? dict.admin.errors.photo
            : null;

  return (
    <form action={action} className="grid max-w-3xl gap-6">
      <input type="hidden" name="locale" value={locale} />
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}
      {message ? <p className="text-sm text-chili">{message}</p> : null}
      {error === "saved" ? <p className="text-sm text-emerald-300">{dict.admin.saved}</p> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        {product ? (
          <p className="text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{dict.admin.slug}</span>
            <span className="mt-2 block">{product.slug}</span>
          </p>
        ) : (
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
            {dict.admin.slug}
            <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder={dict.admin.example.slug} className={fieldClass} />
          </label>
        )}
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.accent}
          <select name="accent" defaultValue={product?.accent ?? "bone"} className={fieldClass}>
            {accents.map((accent) => (
              <option key={accent} value={accent}>
                {accent === "bone" ? dict.home.classic : accent === "teriyaki" ? dict.home.sweet : dict.home.hot}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-[#9c9186]">{dict.admin.accentHint}</span>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.sort}
          <input name="sortOrder" type="number" min={0} max={999} required defaultValue={product?.sortOrder ?? 0} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.weight}
          <input name="netWeightG" type="number" min={1} max={5000} required defaultValue={product?.netWeightG ?? 100} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.price}
          <input name="price" inputMode="decimal" defaultValue={formatPriceInput(product?.priceMinor ?? null)} placeholder={dict.admin.example.price} className={fieldClass} />
          <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-[#9c9186]">{dict.admin.priceHint}</span>
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? false} className="h-4 w-4 accent-[#e7d3bc]" />
        {dict.admin.published}
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
        {dict.admin.photo}
        {product?.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.photo} alt="" className="mt-3 aspect-[3/4] w-40 object-cover" />
        ) : null}
        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-3 file:border-0 file:bg-transparent file:text-xs file:uppercase file:tracking-[0.14em] file:text-[#e7d3bc]`} />
        <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-[#9c9186]">{dict.admin.photoHint}</span>
      </label>
      {locales.map((item) => {
        const copy = product?.translations.find((translation) => translation.locale === item);
        return (
          <fieldset key={item} className="grid gap-4 rounded-xl border border-white/10 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{item}</legend>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
              {dict.auth.name}
              <input name={`name-${item}`} required maxLength={120} defaultValue={copy?.name ?? ""} placeholder={dict.admin.example.name[item]} className={fieldClass} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
              {dict.admin.card}
              <textarea name={`card-${item}`} maxLength={400} rows={3} defaultValue={copy?.card ?? ""} placeholder={dict.admin.example.card[item]} className={fieldClass} />
              <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-[#9c9186]">{dict.admin.cardHint}</span>
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
              {dict.admin.profile}
              <textarea name={`profile-${item}`} required maxLength={2000} rows={4} defaultValue={copy?.profile ?? ""} placeholder={dict.admin.example.profile[item]} className={fieldClass} />
            </label>
          </fieldset>
        );
      })}
      <button type="submit" className="w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
        {dict.admin.save}
      </button>
    </form>
  );
}
