import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { listAdminRecipes } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.recipes };
}

export default async function AdminRecipesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await readLocale(params);
  const recipes = await listAdminRecipes();
  const copy = dict.admin.terminal.recipe;

  return (
    <AdminPage
      title={dict.admin.terminal.recipes}
      lede={copy.private}
      action={
        <Link href={`/${locale}/admin/recipes/new`} className="rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
          {copy.newTitle}
        </Link>
      }
    >
      {recipes.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.empty}</p> : null}
      <ul className="grid gap-2">
        {recipes.map((recipe) => {
          const product = recipe.product?.translations.find((item) => item.locale === locale)?.name;
          const version = recipe.versions[0]?.versionNumber;
          return (
            <li key={recipe.id}>
              <Link href={`/${locale}/admin/recipes/${recipe.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3">
                <span>
                  <span className="block">{recipe.title}</span>
                  <span className="text-xs text-[#9c9186]">{[product, version ? `${copy.version} ${version}` : null].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="rounded-full bg-[#3c2e24] px-2.5 py-1 text-[11px] text-[#efd3b6]">{dict.admin.terminal.recipeStatuses[recipe.status]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminPage>
  );
}
