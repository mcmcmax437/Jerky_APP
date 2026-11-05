"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";
import type { Locale } from "@/lib/i18n/locales";

export function CartLink({ locale, label }: { locale: Locale; label: string }) {
  const { count } = useCart();

  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={count > 0 ? `${label}: ${count}` : label}
      className="relative inline-flex h-11 w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
    >
      <ShoppingBag aria-hidden="true" size={18} />
      <span className="absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-copper px-1 text-[9px] leading-none text-text-light tabular-nums">
        {count}
      </span>
    </Link>
  );
}
