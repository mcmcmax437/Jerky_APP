import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import { OrderStatusPill } from "@/components/admin/OrderStatus";
import { percentChange, type adminPulse } from "@/features/admin/queries";
import { formatPrice } from "@/lib/format";
import { localeTag, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Pulse = Awaited<ReturnType<typeof adminPulse>>;
type Status = Pulse["latest"][number]["status"];

const flavorColor: Record<string, string> = {
  original: "#e4d2bc",
  teriyaki: "#c4a27a",
  "hot-chili": "#8a4038",
};

function money(value: number | null, locale: Locale, empty: string) {
  return value == null ? empty : formatPrice(value, locale, empty);
}

function kilos(grams: number | null, locale: Locale) {
  if (grams == null) return null;
  return `${new Intl.NumberFormat(localeTag(locale), { maximumFractionDigits: 1 }).format(grams / 1000)} kg`;
}

function packsWord(count: number, locale: Locale, fallback: string) {
  if (locale !== "pl") return fallback;
  if (count === 1) return "opakowanie";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "opakowania";
  return "opakowań";
}

function reviewWord(count: number, locale: Locale, fallback: string) {
  if (locale !== "pl") return fallback;
  if (count === 1) return "opinia";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "opinie";
  return "opinii";
}

function Delta({ value }: { value: number | null }) {
  if (value == null) return null;
  const up = value >= 0;
  return <span className={`text-xs ${up ? "text-emerald-400" : "text-red-300"}`}>{up ? "↑" : "↓"} {Math.abs(value)}%</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-white/10 bg-[#161412] p-4 ${className}`}>{children}</section>;
}

function StatusPill({ status, label }: { status: Status; label: string }) {
  return <OrderStatusPill status={status} label={label} />;
}

function SalesChart({
  points,
  moneyLabels,
  locale,
  empty,
}: {
  points: { label: string; value: number }[];
  moneyLabels: boolean;
  locale: Locale;
  empty: string;
}) {
  const width = 560;
  const height = 190;
  const max = Math.max(1, ...points.map((point) => point.value));
  const coords = points.map((point, index) => {
    const x = 28 + (index * (width - 56)) / Math.max(1, points.length - 1);
    const y = 28 + (1 - point.value / max) * 120;
    return { ...point, x, y };
  });
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const peak = coords.reduce((best, point) => (point.value > best.value ? point : best), coords[0]);
  const label = moneyLabels ? formatPrice(Math.round(peak.value), locale, empty) : String(peak.value);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-48 w-full" role="img">
      <path d={path} fill="none" stroke="#c4a27a" strokeWidth="2" />
      {coords.map((point) => (
        <circle key={point.label} cx={point.x} cy={point.y} r={point === peak && peak.value > 0 ? 4 : 2.5} fill="#e7d3bc" />
      ))}
      {peak && peak.value > 0 ? (
        <text x={peak.x} y={Math.max(16, peak.y - 12)} textAnchor="middle" fill="#f3efe6" fontSize="12">
          {label}
        </text>
      ) : null}
      {coords.map((point) => (
        <text key={`${point.label}-axis`} x={point.x} y={height - 8} textAnchor="middle" fill="#9c9186" fontSize="11">
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function FlavorDonut({ slices, total, empty }: { slices: { slug: string; name: string; packs: number }[]; total: number; empty: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const arcs = slices.reduce<Array<{ slug: string; name: string; packs: number; length: number; offset: number }>>((list, slice) => {
    const used = list.reduce((sum, arc) => sum + arc.length, 0);
    const length = total === 0 ? 0 : (slice.packs / total) * circumference;
    return [...list, { ...slice, length, offset: used }];
  }, []);

  return (
    <div className="mt-4 flex items-center gap-4">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#2a2622" strokeWidth="12" />
          {arcs.map((arc) => (
            <circle
              key={arc.slug}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={flavorColor[arc.slug] ?? "#8d8074"}
              strokeWidth="12"
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
            />
          ))}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl">{total === 0 ? "—" : total}</span>
      </div>
      {total === 0 ? (
        <p className="text-sm text-[#b7aa9d]">{empty}</p>
      ) : (
        <ul className="grid gap-2 text-sm">
          {slices.map((slice) => (
            <li key={slice.slug} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: flavorColor[slice.slug] ?? "#8d8074" }} />
              <span>{slice.name}</span>
              <span className="text-[#b7aa9d]">{Math.round((slice.packs / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Desk({
  locale,
  dict,
  pulse,
}: {
  locale: Locale;
  dict: Dictionary;
  pulse: Pulse;
}) {
  const copy = dict.admin.terminal;
  const hasMoney = pulse.revenueMinor != null;
  const points = pulse.buckets.map((bucket) => ({
    label: new Intl.DateTimeFormat(localeTag(locale), { day: "numeric", month: "short" }).format(bucket.start),
    value: hasMoney ? (bucket.revenueMinor ?? 0) : bucket.orders,
  }));
  const knownFlavors = [
    { slug: "original", name: "ORIGINAL" },
    { slug: "teriyaki", name: "TERIYAKI" },
    { slug: "hot-chili", name: "HOT CHILI" },
  ];
  const flavors = [
    ...knownFlavors.map((item) => pulse.flavors.find((flavor) => flavor.slug === item.slug) ?? { ...item, packs: 0 }),
    ...pulse.flavors.filter((flavor) => !knownFlavors.some((item) => item.slug === flavor.slug)),
  ];
  const packs = flavors.reduce((sum, flavor) => sum + flavor.packs, 0);
  const actions = [
    { href: `/${locale}/admin/products/new`, label: copy.addProduct, icon: "package-add" },
    { href: `/${locale}/admin/recipes/new`, label: copy.addRecipe, icon: "chef-hat" },
    { href: `/${locale}/admin/batches`, label: copy.planBatch, icon: "clipboard-plus" },
    { href: `/${locale}/admin/costs`, label: copy.addCost, icon: "invoice-01" },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-[#b7aa9d]">{dict.admin.orderCount}</p>
          <p className="mt-2 flex items-end gap-3 font-display text-4xl">{pulse.orders}<Delta value={percentChange(pulse.orders, pulse.previousOrders)} /></p>
        </Card>
        <Card>
          <p className="text-sm text-[#b7aa9d]">{copy.revenue}</p>
          <p className="mt-2 flex items-end gap-3 font-display text-4xl">
            {money(pulse.revenueMinor, locale, "—")}
            <Delta value={pulse.revenueMinor != null && pulse.previousRevenueMinor != null ? percentChange(pulse.revenueMinor, pulse.previousRevenueMinor) : null} />
          </p>
          {pulse.revenueMinor == null ? <p className="mt-1 text-xs text-[#9c9186]">{copy.noMoney}</p> : null}
        </Card>
        <Card>
          <p className="text-sm text-[#b7aa9d]">{copy.produced}</p>
          <p className="mt-2 font-display text-4xl">{kilos(pulse.producedGrams, locale) ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-[#b7aa9d]">{copy.rating}</p>
          <p className="mt-2 font-display text-4xl">{pulse.rating == null ? "— / 5" : `${pulse.rating.toFixed(1)} / 5`}</p>
          <p className="mt-1 text-xs text-[#9c9186]">({pulse.reviewCount} {reviewWord(pulse.reviewCount, locale, copy.reviewsCount)})</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.9fr)_minmax(200px,0.75fr)]">
        <Card>
          <h2 className="text-lg">{copy.sales}</h2>
          {!hasMoney ? <p className="mt-1 text-xs text-[#9c9186]">{copy.orderSeries}</p> : null}
          {points.every((point) => point.value === 0) ? <p className="mt-8 text-sm text-[#b7aa9d]">{copy.emptyPeriod}</p> : null}
          <SalesChart points={points} moneyLabels={hasMoney} locale={locale} empty={copy.noMoney} />
        </Card>
        <Card>
          <h2 className="text-lg">{copy.byFlavor}</h2>
          <FlavorDonut slices={flavors} total={packs} empty={copy.emptyPeriod} />
          <p className="mt-3 text-xs text-[#9c9186]">{packs} {packsWord(packs, locale, copy.packs)}</p>
        </Card>
        <Card>
          <h2 className="text-lg">{copy.actions}</h2>
          <ul className="mt-3 grid gap-2">
            {actions.map((action) => {
              return (
                <li key={action.href}>
                  <Link href={action.href} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 text-sm hover:border-copper">
                    <Icon name={action.icon} />
                    {action.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-base">{copy.recentOrders}</h2>
            <Link href={`/${locale}/admin/orders`} className="text-xs text-[#d7b89a]">{copy.seeAll} →</Link>
          </div>
          {pulse.latest.length === 0 ? <p className="mt-6 text-sm text-[#b7aa9d]">{copy.emptyPeriod}</p> : null}
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs text-[#9c9186]">
              <tr>
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">{dict.admin.customer}</th>
                <th className="py-2 pr-3 font-medium whitespace-nowrap">{copy.sum}</th>
                <th className="py-2 font-medium whitespace-nowrap">{dict.admin.status}</th>
              </tr>
            </thead>
            <tbody>
              {pulse.latest.map((order) => (
                <tr key={order.id} className="border-t border-white/8">
                  <td className="py-3 pr-2">
                    <Link href={`/${locale}/admin/orders/${order.id}`} className="text-[#e7d3bc]">{order.number}</Link>
                  </td>
                  <td className="py-3 pr-2">{order.customerName}</td>
                  <td className="py-3 pr-2">{money(order.totalMinor, locale, "—")}</td>
                  <td className="py-3"><StatusPill status={order.status} label={dict.admin.statuses[order.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-base">{copy.recipesTitle}</h2>
            <Link href={`/${locale}/admin/recipes`} className="text-xs text-[#d7b89a]">{copy.seeAll} →</Link>
          </div>
          {pulse.recipes.length === 0 ? <p className="mt-6 text-sm text-[#b7aa9d]">{copy.moduleEmpty}</p> : null}
          <ul className="mt-3 grid gap-3">
            {pulse.recipes.map((recipe) => {
              const version = recipe.versions[0];
              const name = recipe.product?.translations.find((item) => item.locale === locale)?.name ?? recipe.title;
              const score = version?.batches[0]?.evaluation?.overall;
              return (
                <li key={recipe.id} className="flex items-center justify-between gap-3 border-t border-white/8 pt-3">
                  <span>
                    <span className="block">{name}{version ? ` v${version.versionNumber}` : ""}</span>
                    <span className="text-xs text-[#9c9186]">{copy.internalScore}: {score ?? "—"} / 10</span>
                  </span>
                  <span className="rounded-full bg-[#3c2e24] px-2.5 py-1 text-[11px] text-[#efd3b6]">{copy.recipeStatuses[recipe.status]}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-base">{copy.batchesTitle}</h2>
            <Link href={`/${locale}/admin/batches`} className="text-xs text-[#d7b89a]">{copy.seeAll} →</Link>
          </div>
          {pulse.batches.length === 0 ? <p className="mt-6 text-sm text-[#b7aa9d]">{copy.moduleEmpty}</p> : null}
          <ul className="mt-3 grid gap-3">
            {pulse.batches.map((batch) => {
              const product = batch.recipeVersion.recipe.product;
              const name = product?.translations.find((item) => item.locale === locale)?.name ?? batch.recipeVersion.recipe.title;
              return (
                <li key={batch.id} className="flex items-center justify-between gap-3 border-t border-white/8 pt-3 text-sm">
                  <span>{batch.code}</span>
                  <span className="text-[#b7aa9d]">{name}</span>
                  <span>{kilos(batch.output?.finishedWeightG ?? null, locale) ?? "—"}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
