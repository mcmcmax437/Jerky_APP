"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import { Price } from "@/components/product/Price";
import { useCart, type CartAddedPreview } from "@/features/cart/cart-context";
import type { Locale } from "@/lib/i18n/locales";

type AddedNotice = CartAddedPreview & { quantity: number };

export function CartLink({
  locale,
  label,
  addedLabel,
  quantityLabel,
  comingSoon,
  viewLabel,
  closeLabel,
}: {
  locale: Locale;
  label: string;
  addedLabel: string;
  quantityLabel: string;
  comingSoon: string;
  viewLabel: string;
  closeLabel: string;
}) {
  const { count } = useCart();
  const [pulse, setPulse] = useState(0);
  const [notice, setNotice] = useState<AddedNotice | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onAdded = (event: Event) => {
      const detail = (event as CustomEvent<AddedNotice>).detail;
      setPulse((current) => current + 1);
      if (!detail?.name) return;
      setNotice(detail);
    };
    window.addEventListener("jerky-cart-added", onAdded);
    return () => window.removeEventListener("jerky-cart-added", onAdded);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setNotice(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotice(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [notice]);

  return (
    <div ref={rootRef} className="relative">
      <Link
        href={`/${locale}/cart`}
        aria-label={count > 0 ? `${label}: ${count}` : label}
        className="press relative inline-flex h-11 w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        <span key={pulse} className={pulse > 0 ? "cart-bag-pop inline-flex" : "inline-flex"}>
          <Icon name="shopping-bag-01" size={18} />
        </span>
        <span
          key={`count-${pulse}`}
          className={`absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-copper px-1 text-[9px] leading-none text-text-light tabular-nums ${pulse > 0 ? "cart-badge-pop" : ""}`}
        >
          {count}
        </span>
      </Link>
      {notice ? (
        <div role="status" className="cart-pop-in absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-ink-800/10 bg-ivory-100 p-4 text-text-dark shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">{addedLabel}</p>
            <button type="button" aria-label={closeLabel} onClick={() => setNotice(null)} className="grid h-7 w-7 place-items-center text-lg leading-none text-text-dark/60">
              ×
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={notice.image} alt="" className="h-16 w-14 shrink-0 rounded-lg bg-ink-950 object-cover" />
            <div className="min-w-0">
              <p className="truncate font-display text-[28px] leading-none font-medium">{notice.name}</p>
              <p className="mt-1 text-sm text-text-dark/65">
                {quantityLabel}: {notice.quantity}
              </p>
              <Price amountMinor={notice.priceMinor} locale={locale} comingSoon={comingSoon} className="mt-1 text-base" />
            </div>
          </div>
          <Link href={`/${locale}/cart`} className="mt-4 flex h-11 items-center justify-center rounded-xl bg-ink-950 text-[13px] font-semibold uppercase tracking-[1.5px] text-text-light">
            {viewLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
