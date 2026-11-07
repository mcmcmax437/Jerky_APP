"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { MAX_QUANTITY, type CartLine } from "@/features/cart/quote";

const storageKey = "jerky-cart-v1";
const changeEvent = "jerky-cart-change";
const addedEvent = "jerky-cart-added";

export type CartAddedPreview = {
  name: string;
  image: string;
  priceMinor: number | null;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, quantity?: number, preview?: CartAddedPreview) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function parseCart(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const slug = "slug" in item ? item.slug : null;
      const quantity = "quantity" in item ? item.quantity : null;
      if (typeof slug !== "string" || typeof quantity !== "number") return [];
      const safe = Math.floor(quantity);
      if (safe < 1) return [];
      return [{ slug, quantity: Math.min(safe, MAX_QUANTITY) }];
    });
  } catch {
    return [];
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(changeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(changeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readSnapshot() {
  return window.localStorage.getItem(storageKey) ?? "[]";
}

function readServerSnapshot() {
  return "[]";
}

function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(lines));
  window.dispatchEvent(new Event(changeEvent));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readSnapshot, readServerSnapshot);
  const lines = useMemo(() => parseCart(raw), [raw]);

  const value = useMemo<CartContextValue>(() => {
    function commit(next: CartLine[]) {
      writeCart(next);
    }

    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add(slug, quantity = 1, preview) {
        const amount = Math.min(Math.max(Math.floor(quantity) || 1, 1), MAX_QUANTITY);
        const current = lines.find((line) => line.slug === slug);
        const nextQuantity = Math.min((current?.quantity ?? 0) + amount, MAX_QUANTITY);
        const added = nextQuantity - (current?.quantity ?? 0);
        commit(
          current
            ? lines.map((line) => (line.slug === slug ? { ...line, quantity: nextQuantity } : line))
            : [...lines, { slug, quantity: nextQuantity }],
        );
        if (added > 0 && preview) {
          window.dispatchEvent(new CustomEvent(addedEvent, { detail: { ...preview, quantity: added } }));
        }
      },
      setQuantity(slug, quantity) {
        const safe = Math.floor(quantity);
        if (safe < 1) {
          commit(lines.filter((line) => line.slug !== slug));
          return;
        }
        commit(
          lines.map((line) =>
            line.slug === slug ? { ...line, quantity: Math.min(safe, MAX_QUANTITY) } : line,
          ),
        );
      },
      remove(slug) {
        commit(lines.filter((line) => line.slug !== slug));
      },
      clear() {
        commit([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider is missing");
  return value;
}
