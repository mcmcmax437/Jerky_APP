"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/types";

type Tab = "description" | "ingredients" | "nutrition" | "reviews";

export function ProductTabs({
  dict,
  profile,
  image,
  name,
  reviewCount,
  averageRating,
}: {
  dict: Dictionary;
  profile: string;
  image: string | null;
  name: string;
  reviewCount: number;
  averageRating: number | null;
}) {
  const [tab, setTab] = useState<Tab>("description");
  const tabs: { id: Tab; label: string }[] = [
    { id: "description", label: dict.product.tabDescription },
    { id: "ingredients", label: dict.product.tabIngredients },
    { id: "nutrition", label: dict.product.tabNutrition },
    { id: "reviews", label: reviewCount > 0 ? `${dict.product.reviewsTitle} (${reviewCount})` : dict.product.reviewsTitle },
  ];

  return (
    <div>
      <div role="tablist" aria-label={name} className="flex gap-6 overflow-x-auto border-b border-ink-800/10">
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 py-3 text-[13px] font-semibold uppercase tracking-[1.5px] ${
                selected ? "border-[#c4a574] text-text-dark" : "border-transparent text-text-dark/50"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pt-8" role="tabpanel">
        {tab === "description" ? (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <p className="max-w-2xl text-lg leading-relaxed">{profile}</p>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="aspect-[16/10] w-full rounded-2xl object-cover" />
            ) : null}
          </div>
        ) : null}
        {tab === "ingredients" ? (
          <div className="grid max-w-2xl gap-8">
            <p className="text-lg leading-relaxed text-text-dark/80">{dict.product.ingredientsBody}</p>
            <div>
              <h2 className="font-display text-[28px] leading-none font-medium">{dict.product.storageTitle}</h2>
              <p className="mt-3 text-lg leading-relaxed text-text-dark/80">{dict.product.storageBody}</p>
            </div>
          </div>
        ) : null}
        {tab === "nutrition" ? <p className="max-w-2xl text-lg leading-relaxed text-text-dark/80">{dict.product.nutritionBody}</p> : null}
        {tab === "reviews" ? (
          reviewCount === 0 ? (
            <p className="text-lg text-text-dark/80">{dict.product.reviewsEmpty}</p>
          ) : (
            <p className="text-lg tabular-nums">
              {averageRating?.toFixed(1)} / 5 · {reviewCount}
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
