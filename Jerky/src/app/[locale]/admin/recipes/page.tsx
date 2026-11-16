import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { addIngredient, rateRecipe, shoppingList } from "@/features/admin/recipe-actions";
import type { RecipeUnit } from "@/features/admin/recipe";
import { listAdminIngredients, listAdminRecipes } from "@/features/admin/queries";
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

const starPath = "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z";

function Stars({ rating, text }: { rating: number | null; text: string }) {
  const value = rating ?? 0;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, index) => {
        const step = index + 1;
        const portion = Math.max(0, Math.min(1, value - index));
        return (
          <span key={step} className="relative inline-flex h-5 w-5">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-[#3a3029]" fill="currentColor">
              <path d={starPath} />
            </svg>
            <span className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${portion * 100}%` }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-[#e7d3bc]" fill="currentColor">
                <path d={starPath} />
              </svg>
            </span>
            <button
              type="submit"
              name="rating"
              value={String(step - 0.5)}
              aria-label={String(step - 0.5)}
              className="absolute inset-y-0 left-0 w-1/2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            />
            <button
              type="submit"
              name="rating"
              value={String(step)}
              aria-label={String(step)}
              className="absolute inset-y-0 right-0 w-1/2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
            />
          </span>
        );
      })}
      <span className="ml-1 text-xs text-[#9c9186]">{text}</span>
    </span>
  );
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
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8d8278] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

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
        <div className="flex flex-wrap items-center gap-3">
          <details className="relative">
            <summary className="press w-fit cursor-pointer list-none rounded-lg border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#e7d3bc]">
              {copy.ingredients}
            </summary>
            <div className="absolute right-0 z-20 mt-2 grid w-[min(20rem,calc(100vw-3rem))] gap-3 rounded-xl border border-white/10 bg-[#171310] p-4 shadow-2xl">
              <ul className="grid max-h-60 gap-1 overflow-y-auto text-sm">
                {ingredients.length === 0 ? <li className="text-[#9c9186]">—</li> : null}
                {ingredients.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
              <form action={addIngredient} className="grid gap-2">
                <input type="hidden" name="locale" value={locale} />
                <input
                  name="name"
                  maxLength={160}
                  aria-label={copy.ingredientName}
                  placeholder={copy.example.ingredient}
                  className={inputClass}
                />
                <button className="press w-fit rounded-lg bg-[#e7d3bc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
                  {copy.addIngredient}
                </button>
              </form>
              {query.added === "1" ? <p className="text-xs text-emerald-300">{dict.admin.saved}</p> : null}
              {query.error === "fields" ? <p className="text-xs text-chili">{dict.admin.errors.fields}</p> : null}
            </div>
          </details>
          <Link
            href={`/${locale}/admin/recipes/new`}
            className="press inline-flex rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]"
          >
            {copy.newTitle}
          </Link>
        </div>
      }
    >
      {query.rated === "bad" ? <p className="text-sm text-chili">{copy.rateBad}</p> : null}
      {query.rated === "1" ? <p className="text-sm text-emerald-300">{copy.rated}</p> : null}
      {query.error === "fields" ? <p className="text-sm text-chili">{dict.admin.errors.fields}</p> : null}
      {recipes.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.empty}</p> : null}
      <form id="shopping" action={shoppingList}>
        <input type="hidden" name="locale" value={locale} />
      </form>
      {recipes.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-[#9c9186]">
              <tr>
                <th scope="col" className="px-3 py-3">
                  <span className="sr-only">{copy.shopping}</span>
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  №
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.title}
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.version}
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.meat}
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.meatKg}
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.hours}
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.ingredients}
                </th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">
                  {copy.rating}
                </th>
              </tr>
            </thead>
            <tbody className="rise">
              {recipes.map((recipe, index) => {
                const version = recipe.versions[0];
                const rating = recipe.rating == null ? null : Number(recipe.rating.toString());
                const meatKg = version?.rawMeatWeightG == null ? null : version.rawMeatWeightG / 1000;
                return (
                  <tr key={recipe.id} className="border-t border-white/5 align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        form="shopping"
                        name="ids"
                        value={recipe.id}
                        aria-label={recipe.title}
                        defaultChecked={picked.includes(recipe.id)}
                        className="h-4 w-4 accent-[#e7d3bc]"
                      />
                    </td>
                    <td className="px-3 py-3 text-[#9c9186]">{index + 1}</td>
                    <td className="min-w-44 px-3 py-3">
                      <Link href={`/${locale}/admin/recipes/${recipe.id}`} className="press text-[#e7d3bc] hover:underline">
                        {recipe.title}
                      </Link>
                      <span className="mt-1 block text-[11px] text-[#9c9186]">{dict.admin.terminal.recipeStatuses[recipe.status]}</span>
                    </td>
                    <td className="px-3 py-3">{version ? `${copy.version} ${version.versionNumber}` : "—"}</td>
                    <td className="px-3 py-3">{version?.meatType ? copy.meats[version.meatType] : "—"}</td>
                    <td className="px-3 py-3">
                      <form action={rateRecipe} className="flex items-center gap-1">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={recipe.id} />
                        <input
                          name="meatKg"
                          inputMode="decimal"
                          aria-label={copy.meatKg}
                          defaultValue={meatKg == null ? "" : number.format(meatKg)}
                          className="w-20 rounded-lg border border-white/10 bg-[#100e0c] px-2 py-1 text-sm"
                        />
                        <button
                          className="press cursor-pointer rounded-lg border border-white/10 px-2 py-1 text-xs text-[#e7d3bc]"
                          aria-label={copy.meatKg}
                        >
                          ✓
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-3">
                      {version?.marinadeHours == null ? "—" : number.format(Number(version.marinadeHours))}
                    </td>
                    <td className="px-3 py-3">{version ? version.ingredients.length : 0}</td>
                    <td className="px-3 py-3">
                      <form action={rateRecipe}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={recipe.id} />
                        <Stars rating={rating} text={rating == null ? "" : number.format(rating)} />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {recipes.length > 0 ? (
        <button
          form="shopping"
          className="press w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]"
        >
          {copy.shopping}
        </button>
      ) : null}
      {query.shopping === "1" ? (
        <section className="mt-4 grid gap-3 rounded-xl border border-white/10 px-4 py-4">
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
