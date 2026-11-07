import { AccountDesk } from "@/components/account/AccountDesk";
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

      <AccountDesk
        locale={locale}
        copy={copy}
        logoutLabel={dict.auth.logout}
        comingSoon={dict.price.comingSoon}
        email={email}
        orders={orders.map((order) => ({
          id: order.id,
          number: order.number,
          status: order.status,
          statusLabel: dict.admin.statuses[order.status],
          isTest: order.isTest,
          dateLabel: formatDate(order.createdAt, locale),
          totalMinor: order.totalMinor,
          slug: order.items[0]?.slug ?? null,
        }))}
      />
    </div>
  );
}
