import type { Metadata } from "next";
import Link from "next/link";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { isAdminOrderStatus, listAdminOrders } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

const statuses = ["NEW", "CONFIRMED", "PREPARING", "READY", "SHIPPED", "COMPLETED", "CANCELLED", "REFUNDED"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.orders };
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const status = query.status && isAdminOrderStatus(query.status) ? query.status : undefined;
  const orders = await listAdminOrders({ status, query: query.q });

  return (
    <>
      <PageIntro eyebrow={dict.admin.overviewEyebrow} title={dict.admin.orders} lede={dict.admin.overviewLede} />
      <PageBody>
        <form className="flex flex-wrap items-end gap-4" method="get">
          <label className="text-xs font-semibold uppercase tracking-[0.16em]">
            {dict.admin.search}
            <input
              name="q"
              defaultValue={query.q ?? ""}
              className="mt-2 block w-64 border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base font-normal normal-case tracking-normal"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.16em]">
            {dict.admin.status}
            <select
              name="status"
              defaultValue={status ?? ""}
              className="mt-2 block border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base font-normal normal-case tracking-normal"
            >
              <option value="">{dict.admin.all}</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {dict.admin.statuses[item]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="bg-ink-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-light">
            {dict.admin.filter}
          </button>
        </form>
        {orders.length === 0 ? <p>{dict.admin.empty}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800/15 text-xs uppercase tracking-[0.16em]">
                <th className="py-3 pr-4 font-semibold">{dict.order.number}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.customer}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.status}</th>
                <th className="py-3 font-semibold">{dict.admin.latest}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-ink-800/10">
                  <td className="py-3 pr-4">
                    <Link href={`/${locale}/admin/orders/${order.id}`} className="font-semibold underline">
                      {order.number}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    {order.customerName}
                    <span className="mt-1 block text-text-dark/70">{order.email}</span>
                  </td>
                  <td className="py-3 pr-4">{dict.admin.statuses[order.status]}</td>
                  <td className="py-3">{formatDateTime(order.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageBody>
    </>
  );
}
