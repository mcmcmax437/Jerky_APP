import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { Price } from "@/components/product/Price";
import { Button } from "@/components/ui/Button";
import { isOrderStatus } from "@/features/admin/order-status";
import { catalogPackshot } from "@/features/catalog/packshots";
import { getTestOrder } from "@/features/orders/queries";
import { formatDate, formatPrice, formatWeight } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

function packFromName(name: string, netWeightG: number) {
  const match = name.match(/^(.*) · (\d+) g$/);
  if (!match) return { title: name, grams: netWeightG };
  return { title: match[1], grams: Number(match[2]) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { dict } = await readLocale(Promise.resolve({ locale }));
  return { title: dict.order.title };
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const { locale, dict } = await readLocale(Promise.resolve({ locale: localeParam }));
  const order = await getTestOrder(id);
  if (!order) notFound();
  const status = isOrderStatus(order.status) ? dict.admin.statuses[order.status] : order.status;
  const address = [order.addressLine, order.postalCode, order.city, order.country].filter(Boolean).join(", ");

  return (
    <>
      <PageIntro eyebrow={dict.order.eyebrow} title={dict.order.title} />
      <PageBody>
        <p className="max-w-3xl border border-chili/40 bg-ivory-200 px-5 py-4 text-base leading-relaxed">
          {dict.order.banner}
        </p>
        <dl className="grid max-w-3xl gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3">
            <dt className="uppercase tracking-[0.16em]">{dict.order.number}</dt>
            <dd className="tabular-nums">{order.number}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3">
            <dt className="uppercase tracking-[0.16em]">{dict.order.date}</dt>
            <dd>{formatDate(order.createdAt, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3">
            <dt className="uppercase tracking-[0.16em]">{dict.admin.status}</dt>
            <dd>{status}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3">
            <dt className="uppercase tracking-[0.16em]">{dict.checkout.name}</dt>
            <dd className="text-right">{order.customerName}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3">
            <dt className="uppercase tracking-[0.16em]">{dict.checkout.email}</dt>
            <dd className="text-right">{order.email}</dd>
          </div>
          {order.phone ? (
            <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3">
              <dt className="uppercase tracking-[0.16em]">{dict.checkout.phone}</dt>
              <dd>{order.phone}</dd>
            </div>
          ) : null}
          {address ? (
            <div className="flex justify-between gap-4 border-b border-ink-800/10 pb-3 sm:col-span-2">
              <dt className="uppercase tracking-[0.16em]">{dict.checkout.address}</dt>
              <dd className="text-right">{address}</dd>
            </div>
          ) : null}
        </dl>
        <ul className="grid max-w-3xl gap-3">
          {order.items.map((item) => {
            const pack = packFromName(item.name, item.netWeightG);
            return (
              <li key={item.id}>
                <Link href={`/${locale}/product/${item.slug}`} className="flex items-center gap-4 rounded-2xl border border-ink-800/10 bg-white/70 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={catalogPackshot(item.slug)} alt="" className="h-28 w-24 shrink-0 rounded-xl bg-ink-950 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[28px] leading-none font-medium md:text-[34px]">{pack.title}</span>
                    <span className="mt-2 block text-sm text-text-dark/70">
                      {dict.product.packSize}: {formatWeight(pack.grams, locale)}
                    </span>
                    <span className="mt-1 block text-sm text-text-dark/70">
                      {dict.cart.quantity}: {item.quantity}
                    </span>
                    <span className="mt-1 block text-sm tabular-nums text-text-dark/70">
                      {formatPrice(item.unitPriceMinor, locale, dict.price.comingSoon)}
                    </span>
                  </span>
                  <Price amountMinor={item.lineTotalMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex max-w-3xl items-center justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{dict.cart.total}</span>
          <Price amountMinor={order.totalMinor} locale={locale} comingSoon={dict.price.comingSoon} />
        </div>
        <div>
          <Button href={`/${locale}/shop`} tone="light">
            {dict.order.back}
          </Button>
        </div>
      </PageBody>
    </>
  );
}
