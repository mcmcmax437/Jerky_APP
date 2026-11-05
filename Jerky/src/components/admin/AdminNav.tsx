"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAccount } from "@/features/auth/actions";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";
import { Container } from "@/components/layout/Container";

export function AdminNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const items = [
    { href: `/${locale}/admin`, label: dict.admin.dashboard, exact: true },
    { href: `/${locale}/admin/orders`, label: dict.admin.orders, exact: false },
    { href: `/${locale}/admin/products`, label: dict.admin.products, exact: false },
  ];

  return (
    <div className="border-b border-white/10 bg-ink-900 text-text-light">
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <nav aria-label={dict.nav.admin} className="flex flex-wrap gap-x-6 gap-y-2">
          {items.map((item) => {
            const current = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`text-[11px] font-semibold uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper ${current ? "text-copper" : "text-text-light/75"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <Link href={`/${locale}/shop`} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-light/75">
            {dict.admin.back}
          </Link>
          <form action={logoutAccount}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-light/75">
              {dict.auth.logout}
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}
