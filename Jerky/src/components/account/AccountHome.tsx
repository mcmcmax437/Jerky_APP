import Link from "next/link";
import { logoutAccount } from "@/features/auth/actions";
import { Icon } from "@/components/brand/Icon";
import { Price } from "@/components/product/Price";
import { catalogPackshot } from "@/features/catalog/packshots";
import type { OrderStatusName } from "@/features/admin/order-status";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type AccountOrder = {
  id: string;
  number: string;
  status: OrderStatusName;
  isTest: boolean;
  createdAt: Date;
  totalMinor: number | null;
  items: { slug: string; name: string; quantity: number }[];
};

const statusDot: Record<OrderStatusName, string> = {
  NEW: "bg-copper",
  IN_PROCESS: "bg-[#c4a574]",
  READY: "bg-[#c4a574]",
  SHIPPED: "bg-[#c4a574]",
  DELIVERED: "bg-emerald-600",
  CANCELLED: "bg-[#8d8278]",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AccountHome({
  locale,
  dict,
  name,
  email,
  orders,
}: {
  locale: Locale;
  dict: Dictionary;
  name: string;
  email: string;
  orders: AccountOrder[];
}) {
  const copy = dict.account;
  const sections = [
    { href: "#overview", label: copy.overview, icon: "home-01" },
    { href: "#orders", label: copy.orders, icon: "shopping-bag-01" },
    { href: "#saved", label: copy.saved, icon: "star" },
    { href: "#addresses", label: copy.addresses, icon: "location-01" },
    { href: "#payments", label: copy.payments, icon: "credit-card" },
    { href: "#discounts", label: copy.discounts, icon: "discount" },
    { href: "#settings", label: copy.settings, icon: "settings-01" },
  ];

  return (
    <div className="page-enter bg-[#f3efe8] text-text-dark">
      <section className="relative isolate overflow-hidden bg-ink-950 text-text-light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/hero-jerky-16x9.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[72%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/75 to-ink-950/15" />
        <div className="relative mx-auto flex min-h-56 max-w-[83rem] items-center gap-5 px-5 py-8 md:px-8">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-copper bg-ink-950/70 font-display text-[28px] font-medium">
            {initials(name)}
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">{copy.eyebrow}</p>
            <h1 className="mt-2 font-display text-[34px] leading-[1.05] font-medium md:text-[42px]">
              {copy.welcome}
              <span className="block">{name}</span>
            </h1>
            <p className="mt-2 text-base text-text-light/75">{email}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[83rem] gap-8 px-5 py-8 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-ink-800/10 bg-white/50 p-3">
          <nav aria-label={copy.title} className="grid gap-1">
            {sections.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium ${
                  index === 0 ? "bg-[#2a241f] text-[#f6f1ea]" : "text-text-dark hover:bg-ink-800/5"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </a>
            ))}
          </nav>
          <form action={logoutAccount} className="mt-2 border-t border-ink-800/10 pt-2">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-text-dark hover:bg-ink-800/5">
              <Icon name="logout-01" size={18} />
              {dict.auth.logout}
            </button>
          </form>
        </aside>

        <div className="grid gap-8">
          <section id="overview" className="scroll-mt-24">
            <h2 className="font-display text-[42px] leading-[1.05] font-medium">{copy.overview}</h2>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-text-dark/75">{copy.lede}</p>
            <div className="mt-6 rounded-2xl bg-ink-950 px-5 py-4 text-text-light">
              <p className="font-display text-[28px] leading-none font-medium">{copy.loyalty}</p>
              <p className="mt-2 max-w-md text-base text-text-light/75">{copy.loyaltyBody}</p>
            </div>
          </section>

          <section id="orders" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-[28px] leading-none font-medium md:text-[34px]">{copy.orders}</h2>
              <a href="#orders" className="text-[13px] font-semibold tracking-[1.5px] text-text-dark/70">
                {copy.allOrders}
              </a>
            </div>
            {orders.length === 0 ? <p className="mt-4 text-base text-text-dark/75">{copy.empty}</p> : null}
            <ul className="mt-4 grid gap-3">
              {orders.map((order) => {
                const slug = order.items[0]?.slug;
                return (
                  <li key={order.id}>
                    <Link href={`/${locale}/order-confirmation/${order.id}`} className="flex items-center gap-4 rounded-2xl border border-ink-800/10 bg-white/70 px-3 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slug ? catalogPackshot(slug) : "/catalog/unknown.jpg"} alt="" className="h-14 w-12 shrink-0 rounded-lg bg-ink-950 object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{order.number}</span>
                        <span className="mt-1 block text-sm text-text-dark/60">{formatDate(order.createdAt, locale)}</span>
                      </span>
                      <span className="hidden items-center gap-2 text-sm sm:inline-flex">
                        <span className={`h-2 w-2 rounded-full ${statusDot[order.status]}`} />
                        {dict.admin.statuses[order.status]}
                        {order.isTest ? <span className="text-text-dark/45">{copy.test}</span> : null}
                      </span>
                      <Price amountMinor={order.totalMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                      <span aria-hidden="true" className="text-text-dark/40">›</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <QuietCard id="saved" title={copy.saved} body={copy.savedBody} icon="star" />
            <QuietCard id="addresses" title={copy.addresses} body={copy.addressesBody} icon="location-01" />
            <QuietCard id="payments" title={copy.payments} body={copy.paymentsBody} icon="credit-card" />
            <QuietCard id="discounts" title={copy.discounts} body={copy.discountsBody} icon="discount" />
          </div>

          <section id="settings" className="scroll-mt-24 rounded-2xl border border-ink-800/10 bg-white/70 p-5">
            <h2 className="font-display text-[28px] leading-none font-medium">{copy.settings}</h2>
            <p className="mt-3 text-base text-text-dark/75">{copy.settingsBody}</p>
            <p className="mt-2 font-semibold">{email}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuietCard({ id, title, body, icon }: { id: string; title: string; body: string; icon: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-ink-800/10 bg-white/70 p-5">
      <h2 className="flex items-center gap-3 font-display text-[28px] leading-none font-medium">
        <Icon name={icon} size={18} />
        {title}
      </h2>
      <p className="mt-3 text-base text-text-dark/75">{body}</p>
    </section>
  );
}
