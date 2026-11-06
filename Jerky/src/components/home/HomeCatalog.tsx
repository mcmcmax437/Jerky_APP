"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/brand/Icon";
import { useCart } from "@/features/cart/cart-context";
import { catalogPackshot } from "@/features/catalog/packshots";
import { formatPrice, formatWeight } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Flavor = "all" | "classic" | "sweet" | "hot";
type Sort = "recommended" | "name";

export type HomeProduct = {
  slug: string;
  name: string;
  card: string | null;
  image: string | null;
  netWeightG: number;
  priceMinor: number | null;
  accent: "bone" | "teriyaki" | "chili";
};

const flavorOf: Record<HomeProduct["accent"], Exclude<Flavor, "all">> = {
  bone: "classic",
  teriyaki: "sweet",
  chili: "hot",
};

export function HomeCatalog({
  locale,
  dict,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  products: HomeProduct[];
}) {
  const [flavor, setFlavor] = useState<Flavor>("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const filters: { id: Flavor; label: string }[] = [
    { id: "all", label: dict.home.all },
    { id: "classic", label: dict.home.classic },
    { id: "sweet", label: dict.home.sweet },
    { id: "hot", label: dict.home.hot },
  ];

  const visible = useMemo(() => {
    const filtered = products.filter((product) => flavor === "all" || flavorOf[product.accent] === flavor);
    if (sort === "name") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, locale));
    }
    return filtered;
  }, [flavor, locale, products, sort]);

  return (
    <section className="bg-ivory-100 text-text-dark">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-5 border-b border-ink-800/10 pb-4 md:flex-row md:items-end md:justify-between">
          <div role="group" aria-label={dict.home.filtersLabel} className="flex flex-wrap gap-x-7 gap-y-3">
            {filters.map((item) => {
              const active = flavor === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFlavor(item.id)}
                  className={`text-[11px] font-semibold uppercase tracking-[0.2em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper ${
                    active ? "text-text-dark underline decoration-ink-950 underline-offset-8" : "text-muted hover:text-text-dark"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <span>{dict.home.sortLabel}:</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="bg-transparent text-text-dark uppercase outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
            >
              <option value="recommended">{dict.home.sortRecommended}</option>
              <option value="name">{dict.home.sortName}</option>
            </select>
          </label>
        </div>
        <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
          {visible.map((product) => (
            <FlavorCard key={product.slug} product={product} locale={locale} dict={dict} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlavorCard({
  product,
  locale,
  dict,
}: {
  product: HomeProduct;
  locale: Locale;
  dict: Dictionary;
}) {
  const { add } = useCart();
  const blurb = product.card || dict.home.cards[product.slug as keyof typeof dict.home.cards] || product.name;
  const photo = product.image || catalogPackshot(product.slug);
  const price =
    product.priceMinor == null
      ? dict.home.priceSoon
      : formatPrice(product.priceMinor, locale, dict.home.priceSoon);

  return (
    <article>
      <Link
        href={`/${locale}/product/${product.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
        aria-label={product.name}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="aspect-[3/4] w-full object-cover" />
      </Link>
      <div className="pt-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-[2.6rem] leading-none font-medium tracking-tight">{product.name}</h2>
          {product.slug === "teriyaki" ? (
            <span className="mt-2 shrink-0 bg-[#ead8c4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-copper">
              {dict.home.fresh}
            </span>
          ) : (
            <span className="mt-2 text-sm text-muted">{dict.home.ratingEmpty}</span>
          )}
        </div>
        <p className="mt-3 text-sm text-text-dark/70">{formatWeight(product.netWeightG, locale)}</p>
        <p className="mt-3 min-h-16 text-sm leading-relaxed text-text-dark/80">{blurb}</p>
        <p className={`mt-4 font-display text-xl ${product.priceMinor == null ? "italic text-text-dark/80" : ""}`}>{price}</p>
        <div className="mt-5 flex gap-2">
          <Link
            href={`/${locale}/product/${product.slug}`}
            className="inline-flex flex-1 items-center justify-center bg-ink-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            {dict.home.view} →
          </Link>
          <button
            type="button"
            aria-label={dict.product.add}
            onClick={() => add(product.slug, 1)}
            className="inline-flex h-11 w-11 items-center justify-center border border-ink-800/20 text-text-dark hover:border-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            <Icon name="shopping-bag-01" />
          </button>
        </div>
      </div>
    </article>
  );
}
