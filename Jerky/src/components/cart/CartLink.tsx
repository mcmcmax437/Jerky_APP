"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import { useCart } from "@/features/cart/cart-context";
import type { Locale } from "@/lib/i18n/locales";

export function CartLink({ locale, label }: { locale: Locale; label: string }) {
  const { count } = useCart();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const onAdded = () => setPulse((current) => current + 1);
    window.addEventListener("jerky-cart-added", onAdded);
    return () => window.removeEventListener("jerky-cart-added", onAdded);
  }, []);

  return (
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
  );
}
