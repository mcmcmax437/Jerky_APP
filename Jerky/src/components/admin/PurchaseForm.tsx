"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Unit = "G" | "KG" | "ML" | "L" | "PCS";

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8d8278] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

export function PurchaseForm({
  locale,
  dict,
  action,
  error,
  ingredients,
  today,
}: {
  locale: Locale;
  dict: Dictionary;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  today: string;
  ingredients: { id: string; name: string }[];
}) {
  const copy = dict.admin.terminal.purchase;
  const units = dict.admin.terminal.recipe.units;
  const [unit, setUnit] = useState<Unit>("G");

  return (
    <form action={action} className="grid max-w-3xl gap-4 rounded-xl border border-white/10 p-4">
      <input type="hidden" name="locale" value={locale} />
      {error === "fields" ? <p className="text-sm text-chili">{copy.invalid}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.name}
          <input name="name" required maxLength={160} placeholder={copy.example.name} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.date}
          <input name="purchasedOn" type="date" required defaultValue={today} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d] sm:col-span-2">
          {copy.component}
          <select name="ingredientId" required className={fieldClass} defaultValue="">
            <option value="">{dict.admin.terminal.recipe.choose}</option>
            {ingredients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)]">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.amount}
          <input name="quantity" required inputMode="decimal" placeholder={copy.example.amount} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.unit}
          <select name="unit" required value={unit} onChange={(event) => setUnit(event.target.value as Unit)} className={fieldClass}>
            {(Object.keys(units) as Unit[]).map((item) => (
              <option key={item} value={item}>
                {units[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.unitPrice}
          <input name="unitPrice" required inputMode="decimal" placeholder={copy.example.price} className={fieldClass} />
        </label>
      </div>
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
        {copy.note}
        <input name="note" maxLength={500} placeholder={copy.example.note} className={fieldClass} />
      </label>
      <button
        type="submit"
        disabled={ingredients.length === 0}
        className="w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612] disabled:opacity-40"
      >
        {copy.add}
      </button>
    </form>
  );
}
