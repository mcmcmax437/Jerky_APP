import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { lineCost } from "@/features/costing/calculate";
import { listPurchases } from "@/features/admin/queries";
import { formatAmount } from "@/lib/format";
import { localeTag } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.costs };
}

function amount(value: { toString(): string }) {
  return value.toString().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export default async function AdminCostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await readLocale(params);
  const purchases = await listPurchases();
  const copy = dict.admin.terminal;
  const units = copy.recipe.units;
  const rows = purchases.map((purchase) => {
    const unitPrice = purchase.unitPrice == null ? null : Number(purchase.unitPrice);
    const bought = purchase.quantity == null ? null : Number(purchase.quantity);
    return { purchase, unitPrice, bought, spent: bought != null && unitPrice != null ? lineCost(bought, unitPrice) : null };
  });
  const total = Math.round(rows.reduce((sum, row) => sum + (row.spent ?? 0), 0) * 100) / 100;

  return (
    <AdminPage title={copy.costs} lede={copy.costsLede}>
      {rows.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.costsEmpty}</p> : null}
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[#9c9186]">
              <tr>
                <th className="py-2 pr-4 font-medium">{copy.purchase.name}</th>
                <th className="py-2 pr-4 font-medium">{copy.purchase.amount}</th>
                <th className="py-2 pr-4 font-medium">{copy.purchase.unitPrice}</th>
                <th className="py-2 pr-4 font-medium">{copy.sum}</th>
                <th className="py-2 font-medium">{copy.purchase.date}</th>
              </tr>
            </thead>
            <tbody className="rise-rows">
              {rows.map(({ purchase, unitPrice, bought, spent }) => (
                <tr key={purchase.id} className="border-t border-white/10">
                  <td className="py-3 pr-4">
                    <Link href={`/${locale}/admin/purchases`} className="text-[#e7d3bc]">
                      {purchase.name}
                    </Link>
                    <span className="mt-1 block text-xs text-[#9c9186]">{purchase.recipe.title}</span>
                  </td>
                  <td className="py-3 pr-4">
                    {bought == null || purchase.quantity == null || purchase.unit == null ? copy.purchase.missing : `${amount(purchase.quantity)} ${units[purchase.unit]}`}
                  </td>
                  <td className="py-3 pr-4">{unitPrice == null ? copy.purchase.missing : formatAmount(unitPrice, locale)}</td>
                  <td className="py-3 pr-4">{spent == null ? copy.purchase.missing : formatAmount(spent, locale)}</td>
                  <td className="py-3">{purchase.purchasedOn.toLocaleDateString(localeTag(locale))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-[#f3efe6]">
            {copy.sum}: {formatAmount(total, locale)}
          </p>
        </div>
      ) : null}
    </AdminPage>
  );
}
