"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import { Price } from "@/components/product/Price";
import { useCart } from "@/features/cart/cart-context";
import { catalogPackshot } from "@/features/catalog/packshots";
import type { CatalogProduct } from "@/features/catalog/types";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export function ShopCard({
  product,
  locale,
  dict,
  view,
}: {
  product: CatalogProduct;
  locale: Locale;
  dict: Dictionary;
  view: "grid" | "list";
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedTick, setAddedTick] = useState(0);
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    if (addedTick === 0) return;
    setShowAdded(true);
    const timer = window.setTimeout(() => setShowAdded(false), 1100);
    return () => window.clearTimeout(timer);
  }, [addedTick]);

  const src = product.images[0]?.src ?? catalogPackshot(product.slug);
  const badge = product.accent === "bone" ? dict.home.classic : product.accent === "teriyaki" ? dict.home.sweet : dict.home.hot;
  const list = view === "list";

  return (
    <article className={`group overflow-hidden rounded-2xl bg-[#1b1714] text-[#f6f1ea] transition duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_54px_rgba(20,12,8,0.28)] ${list ? "md:grid md:grid-cols-[252px_minmax(0,1fr)]" : ""}`}>
      <Link href={`/${locale}/product/${product.slug}`} aria-label={product.name} className="relative block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={`w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06] ${list ? "aspect-[4/3] md:aspect-[9/8] md:h-full" : "aspect-[9/8]"}`} />
        <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold uppercase tracking-[1.5px] text-[#f6f1ea]">
          {badge}
        </span>
      </Link>
      <div className="flex flex-col gap-3 p-4 md:p-5">
        <h2 className="font-display text-[28px] leading-none font-medium md:text-[34px]">{product.name}</h2>
        <p className="line-clamp-3 text-base leading-relaxed text-[#f6f1ea]/70">{product.card || product.profile}</p>
        <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} className="text-[#f3e2cc]" />
        <div className="mt-auto flex items-center gap-2 pt-1">
          <div className="flex h-11 flex-1 items-center justify-between rounded-full bg-black/35 px-2">
            <button type="button" aria-label={`${dict.cart.quantity} −`} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="grid h-8 w-8 place-items-center text-lg">
              −
            </button>
            <span className="text-sm tabular-nums">{quantity}</span>
            <button type="button" aria-label={`${dict.cart.quantity} +`} onClick={() => setQuantity((current) => Math.min(20, current + 1))} className="grid h-8 w-8 place-items-center text-lg">
              +
            </button>
          </div>
          <button
            type="button"
            aria-label={showAdded ? dict.product.added : dict.product.add}
            onClick={() => {
              add(product.slug, quantity, { name: product.name, image: src, priceMinor: product.priceMinor });
              setAddedTick((current) => current + 1);
            }}
            className={`press relative grid h-11 w-11 place-items-center rounded-xl text-[#1b1714] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${showAdded ? "bg-[#efe2cf]" : "bg-[#c4a574]"}`}
          >
            {showAdded ? <AddedMark /> : <Icon name="shopping-bag-01" />}
            {showAdded ? (
              <span key={addedTick} className="cart-float pointer-events-none absolute top-0 left-1/2 rounded-full bg-[#2a241f] px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-[#f6f1ea]">
                +{quantity}
              </span>
            ) : null}
          </button>
          <p className="sr-only" role="status">
            {showAdded ? dict.product.added : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

function AddedMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M5 12.5 9.2 17 19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
