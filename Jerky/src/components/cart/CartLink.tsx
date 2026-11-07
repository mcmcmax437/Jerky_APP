"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/brand/Icon";
import { Price } from "@/components/product/Price";
import { catalogPackshot } from "@/features/catalog/packshots";
import { MAX_QUANTITY } from "@/features/cart/quote";
import { quoteCart } from "@/features/checkout/actions";
import { useCart } from "@/features/cart/cart-context";
import type { Quote } from "@/features/cart/quote";
import { formatWeight } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";

const openEvent = "jerky-cart-open";

function totalMinor(quote: Quote | null, lines: { slug: string; quantity: number }[]) {
  if (!quote || lines.length === 0) return null;
  let sum = 0;
  for (const line of lines) {
    const priced = quote.lines.find((item) => item.slug === line.slug);
    if (!priced || priced.unitPriceMinor == null) return null;
    sum += priced.unitPriceMinor * line.quantity;
  }
  return sum;
}

export function CartLink({
  locale,
  label,
  addedLabel,
  title,
  emptyLabel,
  quantityLabel,
  comingSoon,
  totalLabel,
  viewLabel,
  toShopLabel,
  closeLabel,
  removeLabel,
}: {
  locale: Locale;
  label: string;
  addedLabel: string;
  title: string;
  emptyLabel: string;
  quantityLabel: string;
  comingSoon: string;
  totalLabel: string;
  viewLabel: string;
  toShopLabel: string;
  closeLabel: string;
  removeLabel: string;
}) {
  const { lines, count, setQuantity, remove } = useCart();
  const [pulse, setPulse] = useState(0);
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [justAdded, setJustAdded] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const shown = phase !== "closed";

  function closePanel() {
    setPhase((current) => (current === "open" ? "closing" : current));
  }

  useEffect(() => {
    setPhase("closed");
  }, [pathname]);

  useEffect(() => {
    const onAdded = () => {
      setPulse((current) => current + 1);
      setJustAdded(true);
      setPhase("open");
    };
    const onOpen = () => {
      setJustAdded(false);
      setPhase("open");
    };
    window.addEventListener("jerky-cart-added", onAdded);
    window.addEventListener(openEvent, onOpen);
    return () => {
      window.removeEventListener("jerky-cart-added", onAdded);
      window.removeEventListener(openEvent, onOpen);
    };
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closePanel();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") return;
    let active = true;
    void quoteCart(locale, lines).then((next) => {
      if (active) setQuote(next);
    });
    return () => {
      active = false;
    };
  }, [phase, locale, lines]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={phase === "open"}
        aria-controls="cart-pop"
        aria-label={count > 0 ? `${label}: ${count}` : label}
        onClick={() => {
          setJustAdded(false);
          setPhase((current) => (current === "open" ? "closing" : "open"));
        }}
        className="press relative inline-flex h-11 w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
      >
        <span key={pulse} className={pulse > 0 ? "cart-bag-pop inline-flex" : "inline-flex"}>
          <Icon name="shopping-bag-01" size={18} />
        </span>
        <span
          key={`count-${pulse}`}
          className={`absolute top-1 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-copper px-1 text-[9px] leading-none text-text-light tabular-nums ${pulse > 0 ? "cart-badge-pop" : ""}`}
        >
          {count}
        </span>
      </button>
      {shown ? (
        <div
          id="cart-pop"
          role="dialog"
          aria-label={justAdded ? addedLabel : title}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!event.animationName.includes("cart-pop-out")) return;
            setPhase((current) => (current === "closing" ? "closed" : current));
          }}
          className={`${phase === "closing" ? "cart-pop-out" : "cart-pop-in"} absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-ink-800/10 bg-ivory-100 p-4 text-text-dark shadow-[0_24px_50px_rgba(0,0,0,0.35)]`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">
              {justAdded ? addedLabel : title}
            </p>
            <button
              type="button"
              aria-label={closeLabel}
              onClick={closePanel}
              className="grid h-7 w-7 place-items-center text-lg leading-none text-text-dark/60"
            >
              ×
            </button>
          </div>
          {lines.length === 0 ? (
            <div className="mt-4">
              <p className="text-base">{emptyLabel}</p>
              <Link
                href={`/${locale}/shop`}
                className="mt-4 flex h-11 items-center justify-center rounded-xl bg-ink-950 text-[13px] font-semibold uppercase tracking-[1.5px] text-text-light"
              >
                {toShopLabel}
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-3 max-h-[min(22rem,calc(100vh-12rem))] divide-y divide-ink-800/10 overflow-y-auto">
                {lines.map((line) => {
                  const priced =
                    quote?.lines.find((item) => item.slug === line.slug && item.size === line.size) ??
                    quote?.lines.find((item) => item.slug === line.slug);
                  const image = priced?.image || catalogPackshot(line.slug);
                  const lineTotal =
                    priced == null || priced.unitPriceMinor == null
                      ? null
                      : priced.unitPriceMinor * line.quantity;
                  return (
                    <li key={`${line.slug}-${line.size ?? "plain"}`} className="flex items-center gap-3 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" className="h-16 w-14 shrink-0 rounded-lg bg-ink-950 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-[22px] leading-none font-medium">
                          {priced?.name ?? line.slug}
                        </p>
                        {line.size ? <p className="mt-1 text-[13px] font-semibold tracking-[1.5px]">{formatWeight(Number(line.size), locale)}</p> : null}
                        {priced ? (
                          <Price
                            amountMinor={lineTotal}
                            locale={locale}
                            comingSoon={comingSoon}
                            className="mt-1 text-base"
                          />
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <button
                          type="button"
                          aria-label={removeLabel}
                          onClick={() => remove(line.slug, line.size)}
                          className="grid h-5 w-5 place-items-center text-sm leading-none text-text-dark/55"
                        >
                          ×
                        </button>
                        <div className="flex h-9 items-center rounded-lg border border-ink-800/15">
                          <button
                            type="button"
                            aria-label={`${quantityLabel} −`}
                            onClick={() => setQuantity(line.slug, line.quantity - 1, line.size)}
                            disabled={line.quantity <= 1}
                            className="grid h-9 w-8 place-items-center text-lg disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`${quantityLabel} +`}
                            onClick={() => setQuantity(line.slug, Math.min(MAX_QUANTITY, line.quantity + 1), line.size)}
                            disabled={line.quantity >= MAX_QUANTITY}
                            className="grid h-9 w-8 place-items-center text-lg disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-ink-800/10 pt-3">
                <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{totalLabel}</span>
                {quote ? (
                  <Price
                    amountMinor={totalMinor(quote, lines)}
                    locale={locale}
                    comingSoon={comingSoon}
                    className="text-base"
                  />
                ) : null}
              </div>
              <Link
                href={`/${locale}/checkout`}
                className="mt-4 flex h-11 items-center justify-center rounded-xl bg-ink-950 text-[13px] font-semibold uppercase tracking-[1.5px] text-text-light"
              >
                {viewLabel}
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
