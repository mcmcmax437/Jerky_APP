"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Unit = "G" | "KG" | "ML" | "L" | "PCS";
type Line = { name: string; quantity: string; unit: Unit };

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8d8278] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

export function PurchaseForm({
  locale,
  dict,
  action,
  error,
  recipes,
  today,
}: {
  locale: Locale;
  dict: Dictionary;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  today: string;
  recipes: { id: string; title: string; lines: Line[] }[];
}) {
  const copy = dict.admin.terminal.purchase;
  const units = dict.admin.terminal.recipe.units;
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const lines = recipes.find((recipe) => recipe.id === recipeId)?.lines ?? [];
  const [componentName, setComponentName] = useState(lines[0]?.name ?? "");
  const [unit, setUnit] = useState<Unit>(lines[0]?.unit ?? "G");

  return (
    <form action={action} className="grid max-w-3xl gap-4 rounded-xl border border-white/10 p-4">
      <input type="hidden" name="locale" value={locale} />
      {error === "fields" ? <p className="text-sm text-chili">{dict.admin.errors.fields}</p> : null}
      {recipes.length === 0 ? <p className="text-sm text-[#b7aa9d]">{copy.none}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.name}
          <input name="name" required maxLength={160} placeholder={copy.example.name} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.date}
          <input name="purchasedOn" type="date" required defaultValue={today} className={fieldClass} />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.recipe}
          <select
            name="recipeId"
            value={recipeId}
            onChange={(event) => {
              const nextId = event.target.value;
              const nextLines = recipes.find((recipe) => recipe.id === nextId)?.lines ?? [];
              setRecipeId(nextId);
              setComponentName(nextLines[0]?.name ?? "");
              setUnit(nextLines[0]?.unit ?? "G");
            }}
            className={fieldClass}
          >
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.component}
          <select
            name="componentName"
            required
            className={fieldClass}
            value={componentName}
            onChange={(event) => {
              const name = event.target.value;
              setComponentName(name);
              const line = lines.find((item) => item.name === name);
              if (line) setUnit(line.unit);
            }}
          >
            {lines.length === 0 ? <option value="">{recipes.length === 0 ? copy.none : copy.noLines}</option> : null}
            {lines.map((line) => (
              <option key={`${line.name}-${line.unit}`} value={line.name}>
                {line.name} — {line.quantity} {units[line.unit]}
              </option>
            ))}
          </select>
          {recipes.length > 0 && lines.length === 0 ? <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-[#9c9186]">{copy.noLines}</span> : null}
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
      <button type="submit" disabled={lines.length === 0} className="w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612] disabled:opacity-40">
        {copy.add}
      </button>
    </form>
  );
}
