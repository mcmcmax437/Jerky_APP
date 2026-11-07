"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ShopCard } from "@/components/shop/ShopCard";
import { meatTypes, type MeatTypeName } from "@/features/admin/recipe";
import type { CatalogProduct } from "@/features/catalog/types";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type FlavorName = "classic" | "sweet" | "hot";
type Flavor = "all" | FlavorName;
type PriceFilter = "any" | "set" | "pending";
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
  criteria = false,
}: {
  locale: Locale;
  dict: Dictionary;
  products: CatalogProduct[];
  criteria?: boolean;
}) {
  const [flavors, setFlavors] = useState<FlavorName[]>([]);
  const [meats, setMeats] = useState<MeatTypeName[]>([]);
  const [priced, setPriced] = useState<PriceFilter>("any");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<Sort>("recommended");
  const [view, setView] = useState<View>("grid");
  const filterRef = useRef<HTMLDivElement>(null);
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
    const needle = query.trim().toLocaleLowerCase(locale);
    const filtered = products.filter((product) => {
      const flavorOk = flavors.length === 0 || flavors.includes(flavorOf[product.accent]);
      const meatOk = meats.length === 0 || (product.meat != null && meats.includes(product.meat));
      const nameOk = needle.length === 0 || product.name.toLocaleLowerCase(locale).includes(needle);
      const priceOk = priced === "any" || (priced === "set" ? product.priceMinor != null : product.priceMinor == null);
      return flavorOk && meatOk && nameOk && priceOk;
    });
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name, locale));
    return filtered;
  }, [flavors, locale, meats, priced, products, query, sort]);
  const filtersActive = (query.trim() ? 1 : 0) + (flavors.length > 0 ? 1 : 0) + (meats.length > 0 ? 1 : 0) + (priced !== "any" ? 1 : 0);

  useEffect(() => {
    if (!filterOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  return (
    <section className="bg-[#f3efe8] text-text-dark">
      <div className="mx-auto max-w-[83rem] px-5 py-8 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label={dict.home.filtersLabel} className="flex flex-wrap gap-2">
            {filters.map((item) => {
              const active = item.id === "all" ? flavors.length === 0 : flavors.length === 1 && flavors[0] === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (item.id === "all") {
                      setFlavors([]);
                      return;
                    }
                    const next = item.id;
                    setFlavors((current) => (current.length === 1 && current[0] === next ? [] : [next]));
                  }}
                  className={`press inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[1.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
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
            {criteria ? (
              <div ref={filterRef} className="relative">
                <button
                  type="button"
                  aria-expanded={filterOpen}
                  aria-controls="shop-filter"
                  onClick={() => setFilterOpen((current) => !current)}
                  className={`press inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[1.5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper ${
                    filtersActive > 0 || filterOpen ? "bg-[#2a241f] text-[#f6f1ea]" : "border border-ink-800/10 bg-white/50 text-text-dark"
                  }`}
                >
                  {dict.shop.filter}
                  {filtersActive > 0 ? <span className="rounded-full bg-white/15 px-1.5 text-[10px]">{filtersActive}</span> : null}
                </button>
                {filterOpen ? (
                  <div id="shop-filter" className="absolute right-0 z-30 mt-2 max-h-[min(32rem,calc(100vh-8rem))] w-[min(20rem,calc(100vw-2.5rem))] overflow-y-auto rounded-2xl border border-ink-800/10 bg-ivory-100 p-4 text-text-dark shadow-[0_24px_50px_rgba(0,0,0,0.18)]">
                    <label className="block text-[13px] font-semibold uppercase tracking-[1.5px]">
                      {dict.shop.search}
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={dict.shop.searchPlaceholder}
                        className="mt-2 w-full rounded-xl border border-ink-800/15 bg-white px-3 py-2 text-base font-normal tracking-normal normal-case outline-none focus-visible:border-ink-800"
                      />
                    </label>
                    <fieldset className="mt-4">
                      <legend className="text-[13px] font-semibold uppercase tracking-[1.5px]">{dict.shop.flavor}</legend>
                      <div className="mt-2 grid gap-2">
                        {filters.filter((item) => item.id !== "all").map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-base font-normal tracking-normal normal-case">
                            <input
                              type="checkbox"
                              checked={flavors.includes(item.id as FlavorName)}
                              onChange={() =>
                                setFlavors((current) =>
                                  current.includes(item.id as FlavorName)
                                    ? current.filter((flavor) => flavor !== item.id)
                                    : [...current, item.id as FlavorName],
                                )
                              }
                              className="h-4 w-4 accent-[#2a241f]"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="mt-4">
                      <legend className="text-[13px] font-semibold uppercase tracking-[1.5px]">{dict.shop.meat}</legend>
                      <div className="mt-2 grid gap-2">
                        {meatTypes.map((meat) => (
                          <label key={meat} className="flex items-center gap-2 text-base font-normal tracking-normal normal-case">
                            <input
                              type="checkbox"
                              checked={meats.includes(meat)}
                              onChange={() =>
                                setMeats((current) => (current.includes(meat) ? current.filter((item) => item !== meat) : [...current, meat]))
                              }
                              className="h-4 w-4 accent-[#2a241f]"
                            />
                            {dict.admin.terminal.recipe.meats[meat]}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset className="mt-4">
                      <legend className="text-[13px] font-semibold uppercase tracking-[1.5px]">{dict.shop.price}</legend>
                      <div className="mt-2 grid gap-2">
                        {(
                          [
                            ["any", dict.shop.priceAny],
                            ["set", dict.shop.priceSet],
                            ["pending", dict.shop.pricePending],
                          ] as const
                        ).map(([id, label]) => (
                          <label key={id} className="flex items-center gap-2 text-base font-normal tracking-normal normal-case">
                            <input
                              type="radio"
                              name="shop-price"
                              checked={priced === id}
                              onChange={() => setPriced(id)}
                              className="h-4 w-4 accent-[#2a241f]"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setFlavors([]);
                        setMeats([]);
                        setPriced("any");
                      }}
                      className="mt-4 text-[13px] font-semibold uppercase tracking-[1.5px] text-text-dark/70"
                    >
                      {dict.shop.reset}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
            <label className="inline-flex items-center gap-2 rounded-full border border-ink-800/10 bg-white/50 px-3 py-2 text-[13px] font-semibold uppercase tracking-[1.5px] text-muted">
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
        {visible.length === 0 ? <p className="mt-8 text-base text-muted">{dict.shop.empty}</p> : null}
        <div key={`${flavors.join()}-${meats.join()}-${priced}-${sort}-${view}`} className={view === "grid" ? "rise mt-8 grid gap-6 md:grid-cols-3" : "rise mt-8 grid gap-4"}>
          {visible.map((product) => (
            <ShopCard key={product.slug} product={product} locale={locale} dict={dict} view={view} />
          ))}
        </div>
      </div>
    </section>
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
