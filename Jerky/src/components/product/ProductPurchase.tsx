"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PackSizePicker } from "@/components/product/PackSize";
import type { PackSize } from "@/features/cart/quote";

const ProductSizeContext = createContext<{
  size: PackSize;
  setSize: (size: PackSize) => void;
} | null>(null);

export function ProductPurchase({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<PackSize>("M");
  return <ProductSizeContext.Provider value={{ size, setSize }}>{children}</ProductSizeContext.Provider>;
}

export function ProductSizeChoice({ label, tone }: { label: string; tone: "light" | "dark" }) {
  const value = useContext(ProductSizeContext);
  if (!value) return null;
  return (
    <div className="mt-6">
      <p className={`text-[13px] font-semibold uppercase tracking-[1.5px] ${tone === "light" ? "text-text-light/70" : "text-text-dark/70"}`}>
        {label}
      </p>
      <div className="mt-3">
        <PackSizePicker value={value.size} onChange={value.setSize} label={label} tone={tone} />
      </div>
    </div>
  );
}

export function useProductSize() {
  return useContext(ProductSizeContext);
}
