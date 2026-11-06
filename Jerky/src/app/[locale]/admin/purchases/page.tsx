import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { PurchaseForm } from "@/components/admin/PurchaseForm";
import { QrScanner } from "@/components/admin/QrScanner";
import { addPurchaseFromQr, createPurchase, deletePurchase } from "@/features/admin/purchase-actions";
import { listPurchaseRecipes, listPurchases } from "@/features/admin/queries";
import { localeTag } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.purchased };
}

function amount(value: { toString(): string }) {
  return value.toString().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export default async function AdminPurchasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const [recipes, purchases] = await Promise.all([listPurchaseRecipes(), listPurchases()]);
  const copy = dict.admin.terminal.purchase;
  const units = dict.admin.terminal.recipe.units;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AdminPage title={dict.admin.terminal.purchased} lede={copy.lede}>
      {query.saved ? <p className="text-sm text-emerald-300">{dict.admin.saved}</p> : null}
      {query.error === "unknown" ? <p className="text-sm text-chili">{copy.unknown}</p> : null}
      {query.error === "many" ? <p className="text-sm text-chili">{copy.many}</p> : null}
      {query.error === "qr" ? <p className="text-sm text-chili">{copy.unknown}</p> : null}
      <QrScanner locale={locale} dict={dict} action={addPurchaseFromQr} />
      <PurchaseForm
        locale={locale}
        dict={dict}
        action={createPurchase}
        error={query.error}
        today={today}
        recipes={recipes.map((recipe) => ({
          id: recipe.id,
          title: recipe.title,
          lines:
            recipe.versions[0]?.ingredients.map((item) => ({
              name: item.name,
              quantity: amount(item.quantity),
              unit: item.unit,
            })) ?? [],
        }))}
      />
      {purchases.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.empty}</p> : null}
      {purchases.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[#9c9186]">
              <tr>
                <th className="py-2 pr-4 font-medium">{copy.name}</th>
                <th className="py-2 pr-4 font-medium">{copy.recipe}</th>
                <th className="py-2 pr-4 font-medium">{copy.component}</th>
                <th className="py-2 pr-4 font-medium">{copy.quantity}</th>
                <th className="py-2 pr-4 font-medium">{copy.date}</th>
                <th className="py-2 font-medium">{copy.note}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => {
                const line = purchase.recipe.versions[0]?.ingredients.find(
                  (item) => item.name.trim().toLowerCase() === purchase.componentName.trim().toLowerCase(),
                );
                return (
                  <tr key={purchase.id} className="border-t border-white/10 align-top">
                    <td className="py-3 pr-4">{purchase.name}</td>
                    <td className="py-3 pr-4">{purchase.recipe.title}</td>
                    <td className="py-3 pr-4">{purchase.componentName}</td>
                    <td className="py-3 pr-4">{line ? `${amount(line.quantity)} ${units[line.unit]}` : copy.missing}</td>
                    <td className="py-3 pr-4">{purchase.purchasedOn.toLocaleDateString(localeTag(locale))}</td>
                    <td className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[#b7aa9d]">{purchase.note}</span>
                        <form action={deletePurchase}>
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="id" value={purchase.id} />
                          <button type="submit" className="text-xs text-[#b7aa9d]">
                            {copy.remove}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminPage>
  );
}
