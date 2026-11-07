"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Price } from "@/components/product/Price";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";
import { quoteCart } from "@/features/checkout/actions";
import type { Quote } from "@/features/cart/quote";
import { formatWeight } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export function CartView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { lines, setQuantity, remove } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    let active = true;
    void quoteCart(locale, lines).then((next) => {
      if (active) setQuote(next);
    });
    return () => {
      active = false;
    };
  }, [locale, lines]);

  if (lines.length === 0) {
    return (
      <div className="max-w-xl">
        <p className="text-lg">{dict.cart.empty}</p>
        <div className="mt-8">
          <Button href={`/${locale}/shop`} tone="light">
            {dict.cart.toShop}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <ul className="rise divide-y divide-ink-800/10 border-y border-ink-800/10">
        {lines.map((line) => {
          const priced =
            quote?.lines.find((item) => item.slug === line.slug && item.size === line.size) ??
            quote?.lines.find((item) => item.slug === line.slug);
          const lineTotal =
            priced == null || priced.unitPriceMinor == null ? null : priced.unitPriceMinor * line.quantity;
          return (
            <li key={`${line.slug}-${line.size ?? "plain"}`} className="grid gap-4 py-6 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center">
              {priced?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={priced.image} alt="" className="h-24 w-24 bg-ink-950 object-cover" />
              ) : (
                <div className="h-24 w-24 bg-ink-800" />
              )}
              <div>
                <h2 className="font-display text-[28px] leading-none font-medium md:text-[34px]">
                  {priced?.name ?? line.slug}
                  {line.size ? (
                    <span className="ml-3 align-middle font-sans text-[13px] font-semibold tracking-[1.5px]">
                      {formatWeight(Number(line.size), locale)}
                    </span>
                  ) : null}
                </h2>
                <p className="mt-1 text-sm text-text-dark/70">
                  {formatWeight(priced?.netWeightG ?? 100, locale)}
                </p>
                <label className="mt-4 flex items-center gap-3 text-sm">
                  <span>{dict.cart.quantity}</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={line.quantity}
                    onChange={(event) => setQuantity(line.slug, Number(event.target.value), line.size)}
                    className="w-20 border border-ink-800/20 bg-ivory-100 px-3 py-2 tabular-nums outline-none focus-visible:border-ink-800"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                <Price
                  amountMinor={priced ? lineTotal : null}
                  locale={locale}
                  comingSoon={dict.price.comingSoon}
                />
                <button
                  type="button"
                  onClick={() => remove(line.slug, line.size)}
                  className="text-[13px] font-semibold uppercase tracking-[1.5px] text-text-dark/70 hover:text-text-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
                >
                  {dict.cart.remove}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="h-fit border border-ink-800/10 bg-ivory-200 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{dict.cart.total}</span>
          <Price
            amountMinor={quote?.totalMinor ?? null}
            locale={locale}
            comingSoon={dict.price.comingSoon}
          />
        </div>
        {quote?.pricePending ? (
          <p className="mt-4 text-base leading-relaxed text-text-dark/80">{dict.cart.pricePending}</p>
        ) : null}
        <p className="mt-4 text-base leading-relaxed text-text-dark/80">{dict.cart.note}</p>
        <div className="mt-6">
          <Button href={`/${locale}/checkout`} tone="light" className="w-full">
            {dict.cart.checkout}
          </Button>
        </div>
        <Link href={`/${locale}/shop`} className="mt-4 inline-block text-[13px] font-semibold uppercase tracking-[1.5px]">
          {dict.cart.toShop}
        </Link>
      </aside>
    </div>
  );
}
