"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountSettings } from "@/components/account/AccountSettings";
import { logoutAccount } from "@/features/auth/actions";
import { Icon } from "@/components/brand/Icon";
import { Price } from "@/components/product/Price";
import { catalogPackshot } from "@/features/catalog/packshots";
import type { OrderStatusName } from "@/features/admin/order-status";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

const sectionIds = ["overview", "orders", "saved", "addresses", "payments", "discounts", "settings"] as const;

type SectionId = (typeof sectionIds)[number];

type DeskMessage = {
  id: string;
  body: string;
  dateLabel: string;
};

type DeskOrder = {
  id: string;
  number: string;
  status: OrderStatusName;
  statusLabel: string;
  isTest: boolean;
  dateLabel: string;
  totalMinor: number | null;
  slug: string | null;
};

const statusDot: Record<OrderStatusName, string> = {
  NEW: "bg-copper",
  IN_PROCESS: "bg-[#c4a574]",
  READY: "bg-[#c4a574]",
  PACKING: "bg-[#c4a574]",
  SHIPPED: "bg-[#c4a574]",
  DELIVERED: "bg-emerald-600",
  CANCELLED: "bg-[#8d8278]",
};

function isSection(value: string): value is SectionId {
  return (sectionIds as readonly string[]).includes(value);
}

function sectionFromHash() {
  const value = window.location.hash.replace("#", "");
  return isSection(value) ? value : "overview";
}

export function AccountDesk({
  locale,
  copy,
  dict,
  logoutLabel,
  comingSoon,
  pendingLabel,
  confirmLabel,
  name,
  email,
  orders,
  messages,
}: {
  locale: Locale;
  copy: Dictionary["account"];
  dict: Dictionary;
  logoutLabel: string;
  comingSoon: string;
  pendingLabel: string;
  confirmLabel: string;
  name: string;
  email: string;
  orders: DeskOrder[];
  messages: DeskMessage[];
}) {
  const [section, setSection] = useState<SectionId>("overview");
  const sections: { id: SectionId; label: string; icon: string }[] = [
    { id: "overview", label: copy.overview, icon: "home-01" },
    { id: "orders", label: copy.orders, icon: "shopping-bag-01" },
    { id: "saved", label: copy.saved, icon: "star" },
    { id: "addresses", label: copy.addresses, icon: "location-01" },
    { id: "payments", label: copy.payments, icon: "credit-card" },
    { id: "discounts", label: copy.discounts, icon: "discount" },
    { id: "settings", label: copy.settings, icon: "settings-01" },
  ];

  useEffect(() => {
    const sync = () => setSection(sectionFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  function choose(id: SectionId) {
    setSection(id);
    const next = `${window.location.pathname}${window.location.search}#${id}`;
    if (window.location.hash !== `#${id}`) window.history.pushState(null, "", next);
    document.getElementById("account-panel")?.focus();
  }

  return (
    <div className="mx-auto grid max-w-[83rem] gap-8 px-5 py-8 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-ink-800/10 bg-white/50 p-3">
        <nav aria-label={copy.title} className="grid gap-1">
          {sections.map((item) => {
            const active = item.id === section;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => choose(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium ${
                  active ? "bg-[#2a241f] text-[#f6f1ea]" : "text-text-dark hover:bg-ink-800/5"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <form action={logoutAccount} className="mt-2 border-t border-ink-800/10 pt-2">
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-text-dark hover:bg-ink-800/5">
            <Icon name="logout-01" size={18} />
            {logoutLabel}
          </button>
        </form>
      </aside>

      <div id="account-panel" tabIndex={-1} className="scroll-mt-24 outline-none">
        {section === "overview" ? (
          <section>
            <h2 className="font-display text-[42px] leading-[1.05] font-medium">{copy.overview}</h2>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-text-dark/75">{copy.lede}</p>
            <div className="mt-6 rounded-2xl bg-ink-950 px-5 py-4 text-text-light">
              <p className="font-display text-[28px] leading-none font-medium">{copy.loyalty}</p>
              <p className="mt-2 max-w-md text-base text-text-light/75">{copy.loyaltyBody}</p>
            </div>
            <div className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <h3 className="font-display text-[28px] leading-none font-medium md:text-[34px]">{copy.orders}</h3>
                <button type="button" onClick={() => choose("orders")} className="text-[13px] font-semibold tracking-[1.5px] text-text-dark/70">
                  {copy.allOrders}
                </button>
              </div>
              <OrderList locale={locale} orders={orders} empty={copy.empty} comingSoon={comingSoon} testLabel={copy.test} dict={dict} />
            </div>
          </section>
        ) : null}

        {section === "orders" ? (
          <section>
            <h2 className="font-display text-[42px] leading-[1.05] font-medium">{copy.orders}</h2>
            <OrderList locale={locale} orders={orders} empty={copy.empty} comingSoon={comingSoon} testLabel={copy.test} dict={dict} />
          </section>
        ) : null}

        {section === "saved" ? <QuietCard title={copy.saved} body={copy.savedBody} icon="star" /> : null}
        {section === "addresses" ? <QuietCard title={copy.addresses} body={copy.addressesBody} icon="location-01" /> : null}
        {section === "payments" ? <QuietCard title={copy.payments} body={copy.paymentsBody} icon="credit-card" /> : null}
        {section === "discounts" ? <QuietCard title={copy.discounts} body={copy.discountsBody} icon="discount" /> : null}

        {section === "settings" ? (
          <AccountSettings name={name} email={email} copy={copy} pendingLabel={pendingLabel} confirmLabel={confirmLabel} messages={messages} />
        ) : null}
      </div>
    </div>
  );
}

function OrderList({
  locale,
  orders,
  empty,
  comingSoon,
  testLabel,
  dict,
}: {
  locale: Locale;
  orders: DeskOrder[];
  empty: string;
  comingSoon: string;
  testLabel: string;
  dict: Dictionary;
}) {
  if (orders.length === 0) return <p className="mt-4 text-base text-text-dark/75">{empty}</p>;
  return (
    <ul className="mt-4 grid gap-4">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/${locale}/order-confirmation/${order.id}`} className="group flex flex-col rounded-2xl border border-ink-800/10 bg-white/70 p-4 transition hover:shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 shrink-0 rounded-full ${statusDot[order.status]}`} />
                <div>
                  <span className="font-display text-[28px] font-medium">{order.number}</span>
                  <span className="ml-3 text-sm text-text-dark/60">{order.dateLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-end">
                <Price amountMinor={order.totalMinor} locale={locale} comingSoon={comingSoon} />
                <div className="hidden items-center gap-2 text-sm sm:flex">
                  {order.isTest ? <span className="text-text-dark/45">{testLabel}</span> : null}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-ink-800/10 pt-4">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-text-dark/60">{dict.account.ordersItem}</p>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li className="flex items-center gap-3 rounded-xl bg-white/50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.slug ? catalogPackshot(order.slug) : "/catalog/unknown.jpg"} alt="" className="h-16 w-14 shrink-0 rounded-lg bg-ink-950 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text-dark">{order.slug ? order.slug.replace(/-/g, " ") : "Product"}</p>
                    <p className="text-sm text-text-dark/70">
                      {dict.cart.quantity}: 1
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-ink-800/10 pt-4">
              <span className="text-sm font-semibold uppercase tracking-[1.5px] text-text-dark/60">{order.statusLabel}</span>
              <span aria-hidden="true" className="text-text-dark/40">›</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function QuietCard({ title, body, icon }: { title: string; body: string; icon: string }) {
  return (
    <section className="rounded-2xl border border-ink-800/10 bg-white/70 p-5">
      <h2 className="flex items-center gap-3 font-display text-[28px] leading-none font-medium">
        <Icon name={icon} size={18} />
        {title}
      </h2>
      <p className="mt-3 text-base text-text-dark/75">{body}</p>
    </section>
  );
}
