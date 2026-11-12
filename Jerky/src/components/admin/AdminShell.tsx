"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAccount } from "@/features/auth/actions";
import { Icon } from "@/components/brand/Icon";
import { LogoLockup } from "@/components/brand/LogoLockup";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export function AdminShell({
  locale,
  dict,
  name,
  newOrders,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  name: string;
  newOrders: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const terminal = dict.admin.terminal;
  const items = [
    { href: `/${locale}/admin`, label: dict.admin.dashboard, icon: "home-01", exact: true },
    { href: `/${locale}/admin/orders`, label: dict.admin.orders, icon: "shopping-bag-01", count: newOrders },
    { href: `/${locale}/admin/products`, label: dict.admin.products, icon: "package" },
    { href: `/${locale}/admin/recipes`, label: terminal.recipes, icon: "book-02" },
    { href: `/${locale}/admin/batches`, label: terminal.batches, icon: "layers-01" },
    { href: `/${locale}/admin/warehouse`, label: terminal.warehouse, icon: "warehouse" },
    { href: `/${locale}/admin/costs`, label: terminal.costs, icon: "pie-chart" },
    { href: `/${locale}/admin/reviews`, label: terminal.reviews, icon: "star" },
    { href: `/${locale}/admin/users`, label: terminal.users, icon: "user-group" },
    { href: `/${locale}/admin/support`, label: terminal.support, icon: "message-01" },
    { href: `/${locale}/admin/visitors`, label: terminal.visitors, icon: "chart-02" },
    { href: `/${locale}/admin/settings`, label: terminal.settings, icon: "settings-01" },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#100e0c] text-[#f3efe6] lg:grid lg:min-h-[calc(100vh-4.75rem)] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="relative border-b border-white/10 bg-[#141210] lg:sticky lg:top-[4.75rem] lg:flex lg:h-[calc(100vh-4.75rem)] lg:flex-col lg:border-r lg:border-b-0">
        <Link href={`/${locale}/admin`} className="flex items-center gap-3 px-5 py-5">
          <LogoLockup compact />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-[#b7a898] uppercase">{terminal.panel}</span>
        </Link>
        <nav aria-label={dict.nav.admin} className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {items.map((item) => {
            const current = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`press flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                  current ? "bg-[#3a2a22] text-[#f0d3b8]" : "text-[#c9bfb4] hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.count ? (
                  <span className="ml-auto rounded-full bg-copper px-1.5 text-[11px] leading-5 text-text-light">{item.count}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden items-center gap-3 border-t border-white/10 px-4 py-4 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a2a22] text-sm text-[#f0d3b8]">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm">{name}</span>
            <span className="block text-xs text-[#9c9186]">{terminal.role}</span>
          </span>
          <form action={logoutAccount} className="ml-auto">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" aria-label={dict.auth.logout} className="text-[#c9bfb4] hover:text-text-light">
              <Icon name="logout-01" />
            </button>
          </form>
        </div>
      </aside>
      <div key={pathname} className={pathname === `/${locale}/admin` ? "page-enter min-w-0" : "min-w-0"}>
        {children}
      </div>
    </div>
  );
}
