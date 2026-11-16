import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { recipeCost } from "@/features/costing/calculate";
import { addIngredient, rateRecipe, shoppingList } from "@/features/admin/recipe-actions";
import { recipeUnits, type RecipeUnit } from "@/features/admin/recipe";
import { listAdminIngredients, listAdminRecipes } from "@/features/admin/queries";
import { formatAmount } from "@/lib/format";
import { localeTag } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.recipes };
}

type ShoppingLine = { name: string; unit: RecipeUnit; quantity: number; recipes: string[] };

function ingredientKey(item: { ingredientId: string | null; name: string }) {
  if (item.ingredientId) return item.ingredientId;
  const name = item.name.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return name.replace(/\s+/g, " ");
}

export default async function AdminRecipesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ shopping?: string; ids?: string; rated?: string; added?: string; error?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const [recipes, ingredients] = await Promise.all([listAdminRecipes(), listAdminIngredients()]);
  const copy = dict.admin.terminal.recipe;
  const picked = (query.ids ?? "").split(",").filter(Boolean);
  const number = new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits: 3 });
  const fieldClass =
    "mt-2 w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8d8278] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

  const lines = new Map<string, ShoppingLine>();
  if (query.shopping === "1") {
    for (const recipe of recipes) {
      if (!picked.includes(recipe.id)) continue;
      for (const item of recipe.versions[0]?.ingredients ?? []) {
        const key = `${ingredientKey(item)}|${item.unit}`;
        const line = lines.get(key) ?? { name: item.name.trim(), unit: item.unit, quantity: 0, recipes: [] };
        line.quantity += Number(item.quantity);
        if (!line.recipes.includes(recipe.title)) line.recipes.push(recipe.title);
        lines.set(key, line);
      }
    }
  }
  const shopping = [...lines.values()].sort((a, b) => a.name.localeCompare(b.name, localeTag(locale)));

  return (
    <AdminPage
      title={dict.admin.terminal.recipes}
      lede={copy.private}
      action={
        <Link href={`/${locale}/admin/recipes/new`} className="press inline-flex rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
          {copy.newTitle}
        </Link>
      }
    >
      {recipes.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.empty}</p> : null}
      <form action={shoppingList} className="grid gap-3">
        <input type="hidden" name="locale" value={locale} />
        <ul className="rise grid gap-2">
          {recipes.map((recipe) => {
            const product = recipe.product?.translations.find((item) => item.locale === locale)?.name;
            const version = recipe.versions[0];
            const cost = recipeCost(
              (version?.ingredients ?? []).map((item) => ({
                quantity: Number(item.quantity),
                unitPrice: item.plannedUnitPrice == null ? null : Number(item.plannedUnitPrice),
              })),
            );
            const rating = recipe.rating == null ? null : Number(recipe.rating.toString());
            const meatKg = version?.rawMeatWeightG == null ? null : version.rawMeatWeightG / 1000;
            return (
              <li key={recipe.id} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
                <input
                  type="checkbox"
                  name="ids"
                  value={recipe.id}
                  aria-label={recipe.title}
                  defaultChecked={picked.includes(recipe.id)}
                  className="h-4 w-4 shrink-0 accent-[#e7d3bc]"
                />
                <Link href={`/${locale}/admin/recipes/${recipe.id}`} className="press flex flex-1 flex-wrap items-center justify-between gap-3">
                  <span>
                    <span className="block">{recipe.title}</span>
                    <span className="text-xs text-[#9c9186]">{[product, version ? `${copy.version} ${version.versionNumber}` : null, `${copy.recipeCost} ${formatAmount(cost.total, locale)}`, rating == null ? null : `${copy.rating} ${number.format(rating)}`, meatKg == null ? null : `${copy.meatKg} ${number.format(meatKg)}`].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="rounded-full bg-[#3c2e24] px-2.5 py-1 text-[11px] text-[#efd3b6]">{dict.admin.terminal.recipeStatuses[recipe.status]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {recipes.length > 0 ? (
          <button className="press w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
            {copy.shopping}
          </button>
        ) : null}
      </form>
      {recipes.length > 0 ? (
        <form
          action={rateRecipe}
          className="grid gap-3 rounded-xl border border-white/10 px-4 py-4"
        >
          <input type="hidden" name="locale" value={locale} />
          {query.rated === "bad" ? <p className="text-sm text-chili">{copy.rateBad}</p> : null}
          {query.rated === "1" ? <p className="text-sm text-emerald-300">{copy.rated}</p> : null}
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
            {copy.title}
            <select name="id" required className={fieldClass}>
              <option value="">{copy.choose}</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
              {copy.rating}
              <input name="rating" inputMode="decimal" placeholder="0-10" className={fieldClass} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
              {copy.meatKg}
              <input name="meatKg" inputMode="decimal" placeholder="12.5" className={fieldClass} />
            </label>
          </div>
          <button className="press w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
            {copy.rate}
          </button>
        </form>
      ) : null}
      <section className="mt-8 grid gap-3 rounded-xl border border-white/10 px-4 py-4">
        <h2 className="font-display text-2xl leading-none">{copy.ingredients}</h2>
        {query.added === "1" ? <p className="mt-1 text-sm text-emerald-300">{dict.admin.saved}</p> : null}
        {query.error === "fields" ? <p className="mt-1 text-sm text-chili">{dict.admin.errors.fields}</p> : null}
        <ul className="grid gap-2">
          {ingredients.map((item) => (
            <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
              <span>{item.name}</span>
              <span className="text-xs text-[#9c9186]">{copy.units[item.unit]}</span>
            </li>
          ))}
        </ul>
        <form action={addIngredient} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
            {copy.ingredientName}
            <input name="name" maxLength={160} placeholder={copy.example.ingredient} className={fieldClass} />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
            {copy.unit}
            <select name="unit" className={fieldClass}>
              {recipeUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {copy.units[unit]}
                </option>
              ))}
            </select>
          </label>
          <button className="press w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
            {copy.addIngredient}
          </button>
        </form>
      </section>
      {query.shopping === "1" ? (
        <section className="mt-8 grid gap-3 rounded-xl border border-white/10 px-4 py-4">
          <div>
            <h2 className="font-display text-2xl leading-none">{copy.shoppingTitle}</h2>
            <p className="mt-1 text-sm text-[#9c9186]">{copy.shoppingLede}</p>
          </div>
          {shopping.length === 0 ? (
            <p className="text-sm text-[#b7aa9d]">{copy.shoppingEmpty}</p>
          ) : (
            <ul className="grid gap-2">
              {shopping.map((line) => (
                <li key={`${line.name}|${line.unit}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/5 pt-2 text-sm">
                  <span>
                    {line.name} — {number.format(line.quantity)} {copy.units[line.unit]}
                  </span>
                  <span className="text-xs text-[#9c9186]">
                    {copy.shoppingFrom}: {line.recipes.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </AdminPage>
  );
}
