import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { Price } from "@/components/product/Price";
import { Button } from "@/components/ui/Button";
import { getTestOrder } from "@/features/orders/queries";
import { formatWeight } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

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

  return (
    <>
      <PageIntro eyebrow={dict.order.eyebrow} title={dict.order.title} />
      <PageBody>
        <p className="max-w-2xl border border-chili/40 bg-ivory-200 px-5 py-4 text-base leading-relaxed">
          {dict.order.banner}
        </p>
        <dl className="grid max-w-xl gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="uppercase tracking-[0.16em]">{dict.order.number}</dt>
            <dd className="tabular-nums">{order.number}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="uppercase tracking-[0.16em]">Status</dt>
            <dd>{dict.order.status}</dd>
          </div>
        </dl>
        <ul className="max-w-xl divide-y divide-ink-800/10 border-y border-ink-800/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-6 py-4">
              <div>
                <p className="font-display text-3xl">{item.name}</p>
                <p className="mt-1 text-sm text-text-dark/70">
                  {formatWeight(item.netWeightG, locale)} · {item.quantity}
                </p>
              </div>
              <Price
                amountMinor={item.lineTotalMinor}
                locale={locale}
                comingSoon={dict.price.comingSoon}
              />
            </li>
          ))}
        </ul>
        <div className="flex max-w-xl items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em]">{dict.cart.total}</span>
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
