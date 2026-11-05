import type { Metadata } from "next";
import Link from "next/link";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { adminCounts, latestOrders } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.overviewTitle };
}

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const [counts, orders] = await Promise.all([adminCounts(), latestOrders()]);

  return (
    <>
      <PageIntro eyebrow={dict.admin.overviewEyebrow} title={dict.admin.overviewTitle} lede={dict.admin.overviewLede} />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/${locale}/admin/orders`} className="border border-ink-800/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">{dict.admin.orderCount}</p>
            <p className="mt-3 font-display text-5xl">{counts.orders}</p>
          </Link>
          <Link href={`/${locale}/admin/products`} className="border border-ink-800/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">{dict.admin.productCount}</p>
            <p className="mt-3 font-display text-5xl">
              {counts.published}/{counts.products}
            </p>
          </Link>
        </div>
        <h2 className="font-display text-4xl">{dict.admin.latest}</h2>
        {orders.length === 0 ? <p>{dict.admin.empty}</p> : null}
        <ul className="divide-y divide-ink-800/10 border-y border-ink-800/10">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/${locale}/admin/orders/${order.id}`} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                <span className="font-semibold">{order.number}</span>
                <span>{order.customerName}</span>
                <span>{dict.admin.statuses[order.status]}</span>
                <span className="text-sm text-text-dark/70">{formatDateTime(order.createdAt, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
