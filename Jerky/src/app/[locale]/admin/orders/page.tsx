import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { Icon } from "@/components/brand/Icon";
import { OrderLines } from "@/components/admin/OrderLines";
import { OrderStatusPill } from "@/components/admin/OrderStatus";
import { orderStatuses } from "@/features/admin/order-status";
import { isAdminOrderStatus, listAdminOrders, orderLines } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

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
  const flatLines = await orderLines(orders.flatMap((order) => order.items));
  const lines = orders.map((order) => {
    const slice = flatLines.splice(0, order.items.length);
    return slice;
  });

  return (
    <AdminPage title={dict.admin.orders} lede={dict.admin.testBanner}>
      <form className="flex flex-wrap items-end gap-4" method="get">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.search}
          <input
            name="q"
            defaultValue={query.q ?? ""}
            className="mt-2 block w-64 rounded-lg border border-white/10 bg-[#161412] px-3 py-3 text-base font-normal text-[#f3efe6] normal-case tracking-normal"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.status}
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-2 block rounded-lg border border-white/10 bg-[#161412] px-3 py-3 text-base font-normal text-[#f3efe6] normal-case tracking-normal"
          >
            <option value="">{dict.admin.all}</option>
            {orderStatuses.map((item) => (
              <option key={item} value={item}>
                {dict.admin.statuses[item]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1612]">
          {dict.admin.filter}
        </button>
      </form>
      {orders.length === 0 ? <p>{dict.admin.empty}</p> : null}
      <ul className="rise divide-y divide-white/10 border-y border-white/10">
        {orders.map((order, index) => (
          <li key={order.id} className="py-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href={`/${locale}/admin/orders/${order.id}`} className="font-semibold text-[#e7d3bc]">
                {order.number}
              </Link>
              <OrderStatusPill status={order.status} label={dict.admin.statuses[order.status]} />
              <span className="text-xs text-[#9c9186]">{formatDateTime(order.createdAt, locale)}</span>
              <Link
                href={`/${locale}/admin/orders/${order.id}`}
                aria-label={dict.admin.editAction}
                className="press inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-[#e7d3bc]"
              >
                <Icon name="settings-02" size={18} />
              </Link>
            </div>
            <p className="mt-2">
              {order.customerName}
              <span className="text-[#9c9186]"> · {order.email}</span>
            </p>
            <div className="mt-2">
              <OrderLines lines={lines[index] ?? []} dict={dict} />
            </div>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
