"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/cart-context";

export function AddToCart({
  slug,
  label,
  addedLabel,
  note,
}: {
  slug: string;
  label: string;
  addedLabel: string;
  note: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <>
      <Button
        tone="light"
        className="w-full"
        aria-describedby="cart-note"
        onClick={() => {
          add(slug, 1);
          setAdded(true);
        }}
      >
        {label}
      </Button>
      <p id="cart-note" className="mt-4 text-base leading-relaxed text-text-dark/80" role="status">
        {added ? addedLabel : note}
      </p>
    </>
  );
}
