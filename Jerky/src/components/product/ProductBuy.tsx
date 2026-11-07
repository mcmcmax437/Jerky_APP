"use client";

import { useState } from "react";
import { Icon } from "@/components/brand/Icon";
import { PackSizePicker } from "@/components/product/PackSize";
import { useCart } from "@/features/cart/cart-context";
import { MAX_QUANTITY, pricedPackGrams, type PackSize } from "@/features/cart/quote";
import { formatPrice, formatWeight } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export function ProductBuy({
  locale,
  dict,
  slug,
  name,
  image,
  priceMinor,
}: {
  locale: Locale;
  dict: Dictionary;
  slug: string;
  name: string;
  image: string;
  priceMinor: number | null;
}) {
  const { add } = useCart();
  const [size, setSize] = useState<PackSize>("100");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(0);
  const grams = Number(size);
  const amount = grams === pricedPackGrams ? priceMinor : null;

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <p className="font-sans text-[32px] leading-none font-semibold tabular-nums text-text-light">
          {formatPrice(amount, locale, dict.price.comingSoon)}
        </p>
        <p className="pb-1 text-sm text-text-light/60">
          {dict.product.weight}: {formatWeight(grams, locale)}
        </p>
      </div>
      <p className="mt-6 text-[13px] font-semibold uppercase tracking-[1.5px] text-text-light/70">{dict.product.packSize}</p>
      <div className="mt-3">
        <PackSizePicker value={size} onChange={setSize} label={dict.product.packSize} locale={locale} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 items-center justify-between rounded-xl border border-white/15 px-2 sm:w-36">
          <button
            type="button"
            aria-label={`${dict.cart.quantity} −`}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="grid h-9 w-9 place-items-center text-lg"
          >
            −
          </button>
          <span className="text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label={`${dict.cart.quantity} +`}
            onClick={() => setQuantity((current) => Math.min(MAX_QUANTITY, current + 1))}
            className="grid h-9 w-9 place-items-center text-lg"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            add(slug, quantity, { name, image, priceMinor: amount }, size);
            setAdded((current) => current + 1);
          }}
          className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c4a574] text-[13px] font-semibold uppercase tracking-[1.5px] text-[#1b1714] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        >
          <Icon name="shopping-bag-01" size={16} />
          <span key={added} className={added > 0 ? "cart-bag-pop inline-flex" : "inline-flex"}>
            {added > 0 ? dict.product.added : dict.product.add}
          </span>
        </button>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-text-light/60" role="status">
        {added > 0 ? dict.product.added : dict.product.addNote}
      </p>
    </div>
  );
}
