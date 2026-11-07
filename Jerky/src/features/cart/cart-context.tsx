"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { isPackSize, MAX_QUANTITY, type CartLine, type PackSize } from "@/features/cart/quote";

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
  add: (slug: string, quantity?: number, preview?: CartAddedPreview, size?: PackSize) => void;
  setQuantity: (slug: string, quantity: number, size?: PackSize) => void;
  remove: (slug: string, size?: PackSize) => void;
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
      const rawSize = "size" in item ? item.size : undefined;
      return [{ slug, quantity: Math.min(safe, MAX_QUANTITY), size: isPackSize(rawSize) ? rawSize : "M" }];
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
      add(slug, quantity = 1, preview, size = "M") {
        const amount = Math.min(Math.max(Math.floor(quantity) || 1, 1), MAX_QUANTITY);
        const current = lines.find((line) => line.slug === slug && (line.size ?? "M") === size);
        const nextQuantity = Math.min((current?.quantity ?? 0) + amount, MAX_QUANTITY);
        const added = nextQuantity - (current?.quantity ?? 0);
        commit(
          current
            ? lines.map((line) =>
                line.slug === slug && (line.size ?? "M") === size ? { ...line, size, quantity: nextQuantity } : line,
              )
            : [...lines, { slug, quantity: nextQuantity, size }],
        );
        if (added > 0 && preview) {
          window.dispatchEvent(new CustomEvent(addedEvent, { detail: { ...preview, quantity: added } }));
        }
      },
      setQuantity(slug, quantity, size = "M") {
        const safe = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity) || 1));
        commit(
          lines.map((line) =>
            line.slug === slug && (line.size ?? "M") === size ? { ...line, size, quantity: safe } : line,
          ),
        );
      },
      remove(slug, size = "M") {
        commit(lines.filter((line) => !(line.slug === slug && (line.size ?? "M") === size)));
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
