import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { recipeCost } from "@/features/costing/calculate";
import { shoppingList } from "@/features/admin/recipe-actions";
import type { RecipeUnit } from "@/features/admin/recipe";
import { listAdminRecipes } from "@/features/admin/queries";
import { formatAmount } from "@/lib/format";
import { localeTag } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.recipes };
}

type ShoppingLine = { name: string; unit: RecipeUnit; quantity: number; recipes: string[] };

export default async function AdminRecipesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ shopping?: string; ids?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const recipes = await listAdminRecipes();
  const copy = dict.admin.terminal.recipe;
  const picked = (query.ids ?? "").split(",").filter(Boolean);
  const number = new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits: 3 });

  const lines = new Map<string, ShoppingLine>();
  if (query.shopping === "1") {
    for (const recipe of recipes) {
      if (!picked.includes(recipe.id)) continue;
      for (const item of recipe.versions[0]?.ingredients ?? []) {
        const key = `${item.name.trim().toLowerCase()}|${item.unit}`;
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
                    <span className="text-xs text-[#9c9186]">{[product, version ? `${copy.version} ${version.versionNumber}` : null, `${copy.recipeCost} ${formatAmount(cost.total, locale)}`].filter(Boolean).join(" · ")}</span>
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
