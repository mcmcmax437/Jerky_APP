"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

const links = [
  { href: "/shop", key: "shop" },
  { href: "/our-story", key: "story" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <nav aria-label={dict.nav.primary} className="hidden items-center gap-8 lg:flex">
      {links.map((item) => {
        const home = `/${locale}`;
        const target = `${home}${item.href}`;
        const path = pathname.replace(/\/$/, "") || home;
        const active =
          item.href === "/shop"
            ? path === home || path === target || path.startsWith(`${target}/`)
            : path === target || path.startsWith(`${target}/`);
        return (
          <Link
            key={item.href}
            href={target}
            aria-current={active ? "page" : undefined}
            className={`relative text-[11px] font-semibold uppercase tracking-[0.22em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper ${
              active
                ? "text-text-light after:absolute after:inset-x-0 after:-bottom-3 after:h-px after:bg-copper"
                : "text-text-light/70 hover:text-text-light"
            }`}
          >
            {dict.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
