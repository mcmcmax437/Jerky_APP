"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import { useCart } from "@/features/cart/cart-context";

const links = [
  { href: "/shop", key: "shop" },
  { href: "/our-story", key: "story" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export function MobileNav({
  locale,
  dict,
  role,
}: {
  locale: Locale;
  dict: Dictionary;
  role: "CUSTOMER" | "ADMIN" | null;
}) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        <span className="sr-only">{open ? dict.nav.closeMenu : dict.nav.openMenu}</span>
      </button>
      {open ? (
        <div id="mobile-menu" className="absolute inset-x-0 top-full border-b border-white/10 bg-ink-950">
          <nav aria-label={dict.nav.primary} className="flex flex-col px-5 py-4">
            {links.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="border-b border-white/10 py-4 text-sm uppercase tracking-[0.18em]"
                onClick={() => setOpen(false)}
              >
                {dict.nav[item.key]}
              </Link>
            ))}
            <div className="flex items-center justify-between py-4">
              <LanguageSwitcher locale={locale} label={dict.nav.language} />
            </div>
            <Link
              href={`/${locale}/account`}
              className="border-b border-white/10 py-4 text-sm uppercase tracking-[0.18em]"
              onClick={() => setOpen(false)}
            >
              {dict.nav.account}
            </Link>
            {role === "ADMIN" ? (
              <Link
                href={`/${locale}/admin`}
                className="border-b border-white/10 py-4 text-sm uppercase tracking-[0.18em]"
                onClick={() => setOpen(false)}
              >
                {dict.nav.admin}
              </Link>
            ) : null}
            <Link
              href={`/${locale}/cart`}
              className="py-4 text-sm uppercase tracking-[0.18em]"
              onClick={() => setOpen(false)}
            >
              {dict.nav.cart}
              {count > 0 ? ` (${count})` : ""}
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
