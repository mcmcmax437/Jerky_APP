"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";
import type { PackSize } from "@/features/cart/quote";

export function AddToCart({
  slug,
  name,
  image,
  priceMinor,
  label,
  addedLabel,
  note,
  size,
  quantity = 1,
}: {
  slug: string;
  name: string;
  image: string;
  priceMinor: number | null;
  label: string;
  addedLabel: string;
  note: string;
  size?: PackSize;
  quantity?: number;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(0);

  return (
    <>
      <Button
        tone="light"
        className="w-full"
        aria-describedby="cart-note"
        onClick={() => {
          add(slug, quantity, { name, image, priceMinor }, size);
          setAdded((current) => current + 1);
        }}
      >
        <span key={added} className={added > 0 ? "cart-bag-pop inline-flex" : "inline-flex"}>
          {added > 0 ? addedLabel : label}
        </span>
      </Button>
      <p id="cart-note" className="mt-4 text-base leading-relaxed text-text-dark/80" role="status">
        {added > 0 ? addedLabel : note}
      </p>
    </>
  );
}
