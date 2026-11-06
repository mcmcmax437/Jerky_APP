"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import { Price } from "@/components/product/Price";
import { useCart } from "@/features/cart/cart-context";
import { catalogPackshot } from "@/features/catalog/packshots";
import type { CatalogProduct } from "@/features/catalog/types";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Flavor = "all" | "classic" | "sweet" | "hot";
type Sort = "recommended" | "name";
type View = "grid" | "list";

const flavorOf: Record<CatalogProduct["accent"], Exclude<Flavor, "all">> = {
  bone: "classic",
  teriyaki: "sweet",
  chili: "hot",
};

export function ShopCatalog({
  locale,
  dict,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  products: CatalogProduct[];
}) {
  const [flavor, setFlavor] = useState<Flavor>("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [view, setView] = useState<View>("grid");
  const counts = {
    all: products.length,
    classic: products.filter((product) => flavorOf[product.accent] === "classic").length,
    sweet: products.filter((product) => flavorOf[product.accent] === "sweet").length,
    hot: products.filter((product) => flavorOf[product.accent] === "hot").length,
  };
  const filters: { id: Flavor; label: string; icon: "all" | "classic" | "sweet" | "hot" }[] = [
    { id: "all", label: dict.shop.all, icon: "all" },
    { id: "classic", label: dict.home.classic, icon: "classic" },
    { id: "sweet", label: dict.home.sweet, icon: "sweet" },
    { id: "hot", label: dict.home.hot, icon: "hot" },
  ];
  const visible = useMemo(() => {
    const filtered = products.filter((product) => flavor === "all" || flavorOf[product.accent] === flavor);
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name, locale));
    return filtered;
  }, [flavor, locale, products, sort]);

  return (
    <section className="bg-[#f3efe8] text-text-dark">
      <div className="mx-auto max-w-[83rem] px-5 py-8 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label={dict.home.filtersLabel} className="flex flex-wrap gap-2">
            {filters.map((item) => {
              const active = flavor === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFlavor(item.id)}
                  className={`press inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                    active ? "bg-[#2a241f] text-[#f6f1ea]" : "border border-ink-800/10 bg-white/40 text-text-dark hover:border-ink-800/30"
                  }`}
                >
                  <FlavorMark kind={item.icon} />
                  {item.label}
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/15" : "bg-ink-800/10"}`}>{counts[item.id]}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-ink-800/10 bg-white/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              <span>{dict.home.sortLabel}:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="bg-transparent text-text-dark uppercase outline-none"
              >
                <option value="recommended">{dict.home.sortRecommended}</option>
                <option value="name">{dict.home.sortName}</option>
              </select>
            </label>
            <div className="inline-flex rounded-full border border-ink-800/10 bg-white/50 p-1">
              <button
                type="button"
                aria-label={dict.shop.viewGrid}
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={`press grid h-8 w-8 place-items-center rounded-full ${view === "grid" ? "bg-[#2a241f] text-[#f6f1ea]" : "text-text-dark"}`}
              >
                <GridMark />
              </button>
              <button
                type="button"
                aria-label={dict.shop.viewList}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={`press grid h-8 w-8 place-items-center rounded-full ${view === "list" ? "bg-[#2a241f] text-[#f6f1ea]" : "text-text-dark"}`}
              >
                <ListMark />
              </button>
            </div>
          </div>
        </div>
        {visible.length === 0 ? <p className="mt-8 text-sm text-muted">{dict.shop.empty}</p> : null}
        <div key={`${flavor}-${sort}-${view}`} className={view === "grid" ? "rise mt-8 grid gap-6 md:grid-cols-3" : "rise mt-8 grid gap-4"}>
          {visible.map((product) => (
            <ShopCard key={product.slug} product={product} locale={locale} dict={dict} view={view} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopCard({
  product,
  locale,
  dict,
  view,
}: {
  product: CatalogProduct;
  locale: Locale;
  dict: Dictionary;
  view: View;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const src = product.images[0]?.src ?? catalogPackshot(product.slug);
  const badge = product.accent === "bone" ? dict.home.classic : product.accent === "teriyaki" ? dict.home.sweet : dict.home.hot;
  const list = view === "list";

  return (
    <article className={`group overflow-hidden rounded-2xl bg-[#1b1714] text-[#f6f1ea] transition duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_54px_rgba(20,12,8,0.28)] ${list ? "md:grid md:grid-cols-[252px_minmax(0,1fr)]" : ""}`}>
      <Link href={`/${locale}/product/${product.slug}`} aria-label={product.name} className="relative block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={`w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06] ${list ? "aspect-[4/3] md:aspect-[9/8] md:h-full" : "aspect-[9/8]"}`} />
        <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f6f1ea]">
          {badge}
        </span>
      </Link>
      <div className="flex flex-col gap-3 p-4 md:p-5">
        <h2 className="font-display text-4xl leading-none font-medium">{product.name}</h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-[#f6f1ea]/70">{product.card || product.profile}</p>
        <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} className="font-display text-3xl text-[#f3e2cc]" />
        <div className="mt-auto flex items-center gap-2 pt-1">
          <div className="flex h-11 flex-1 items-center justify-between rounded-full bg-black/35 px-2">
            <button type="button" aria-label={`${dict.cart.quantity} −`} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="grid h-8 w-8 place-items-center text-lg">
              −
            </button>
            <span className="text-sm tabular-nums">{quantity}</span>
            <button type="button" aria-label={`${dict.cart.quantity} +`} onClick={() => setQuantity((current) => Math.min(20, current + 1))} className="grid h-8 w-8 place-items-center text-lg">
              +
            </button>
          </div>
          <button
            type="button"
            aria-label={dict.product.add}
            onClick={() => add(product.slug, quantity)}
            className="press grid h-11 w-11 place-items-center rounded-xl bg-[#c4a574] text-[#1b1714] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            <Icon name="shopping-bag-01" />
          </button>
        </div>
      </div>
    </article>
  );
}

function FlavorMark({ kind }: { kind: "all" | "classic" | "sweet" | "hot" }) {
  if (kind === "all") return null;
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      {kind === "classic" ? <path d="M3 11c1.2-3 2.2-4 5-4s3.8 1 5 4" fill="none" stroke="currentColor" strokeWidth="1.3" /> : null}
      {kind === "classic" ? <path d="M8 7V3M6.2 4.2 8 3l1.8 1.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /> : null}
      {kind === "sweet" ? <path d="M3.5 6.5h9v5.2a1.3 1.3 0 0 1-1.3 1.3H4.8A1.3 1.3 0 0 1 3.5 11.7zM5 6.5c.2-2 1.2-3 3-3s2.8 1 3 3" fill="none" stroke="currentColor" strokeWidth="1.3" /> : null}
      {kind === "hot" ? <path d="M8 13c2.2 0 3.5-1.6 3.5-3.6 0-2.2-1.6-3.2-1.6-5.2 0 0-1.7 1-1.7 2.6C7.4 5.2 6 4.2 6 4.2 6 6.4 4.5 7.6 4.5 9.6 4.5 11.5 5.8 13 8 13z" fill="none" stroke="currentColor" strokeWidth="1.2" /> : null}
    </svg>
  );
}

function GridMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M2.5 2.5h4.2v4.2H2.5zM9.3 2.5h4.2v4.2H9.3zM2.5 9.3h4.2v4.2H2.5zM9.3 9.3h4.2v4.2H9.3z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ListMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M3 4h10M3 8h10M3 12h10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
