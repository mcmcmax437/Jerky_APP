import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { lineCost, recipeCost } from "@/features/costing/calculate";
import { listAdminRecipes } from "@/features/admin/queries";
import { formatAmount } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.costs };
}

export default async function AdminCostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await readLocale(params);
  const recipes = await listAdminRecipes();
  const copy = dict.admin.terminal.recipe;
  const units = copy.units;

  return (
    <AdminPage title={dict.admin.terminal.costs} lede={copy.costHint}>
      {recipes.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.empty}</p> : null}
      <div className="grid gap-6">
        {recipes.map((recipe) => {
          const ingredients = recipe.versions[0]?.ingredients ?? [];
          const cost = recipeCost(
            ingredients.map((item) => ({
              quantity: Number(item.quantity),
              unitPrice: item.plannedUnitPrice == null ? null : Number(item.plannedUnitPrice),
            })),
          );
          return (
            <section key={recipe.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Link href={`/${locale}/admin/recipes/${recipe.id}`} className="text-base text-[#e7d3bc]">
                  {recipe.title}
                </Link>
                <p className="text-sm">
                  {copy.recipeCost}: {formatAmount(cost.total, locale)}
                </p>
              </div>
              {ingredients.length === 0 ? <p className="mt-4 text-sm text-[#b7aa9d]">{copy.costMissing}</p> : null}
              {ingredients.length > 0 ? (
                <table className="mt-4 w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.16em] text-[#9c9186]">
                    <tr>
                      <th className="py-2 pr-4 font-medium">{copy.ingredientName}</th>
                      <th className="py-2 pr-4 font-medium">{copy.quantity}</th>
                      <th className="py-2 pr-4 font-medium">{copy.unitPrice}</th>
                      <th className="py-2 font-medium">{copy.lineCost}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((item, index) => {
                      const unitPrice = item.plannedUnitPrice == null ? null : Number(item.plannedUnitPrice);
                      const amount = lineCost(Number(item.quantity), unitPrice);
                      return (
                        <tr key={`${recipe.id}-${index}`} className="border-t border-white/10">
                          <td className="py-3 pr-4">{item.name}</td>
                          <td className="py-3 pr-4">
                            {item.quantity.toString()} {units[item.unit]}
                          </td>
                          <td className="py-3 pr-4">{unitPrice == null ? copy.costMissing : formatAmount(unitPrice, locale)}</td>
                          <td className="py-3">{amount == null ? copy.costMissing : formatAmount(amount, locale)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </section>
          );
        })}
      </div>
    </AdminPage>
  );
}
