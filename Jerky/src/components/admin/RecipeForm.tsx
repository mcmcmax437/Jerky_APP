"use client";

import { useState } from "react";
import { lineCost, recipeCost } from "@/features/costing/calculate";
import { meatTypes, recipeUnits, type MeatTypeName, type RecipeUnit } from "@/features/admin/recipe";
import { formatAmount } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type ComponentFields = { name: string; quantity: string; unit: RecipeUnit; unitPrice: string };
type ComponentRow = ComponentFields & { id: string };

function blankRow(): ComponentRow {
  return { id: crypto.randomUUID(), name: "", quantity: "", unit: "G", unitPrice: "" };
}

function parseAmount(value: string) {
  const text = value.trim().replace(",", ".");
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

export function RecipeForm({
  locale,
  dict,
  action,
  error,
  saved,
  products,
  recipe,
}: {
  locale: Locale;
  dict: Dictionary;
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  saved?: boolean;
  products: { id: string; name: string }[];
  recipe?: {
    id: string;
    title: string;
    status: string;
    productId: string | null;
    versionNumber: number;
    meatType: MeatTypeName | "";
    marinadeHours: string;
    processPlan: string;
    components: ComponentFields[];
  };
}) {
  const copy = dict.admin.terminal.recipe;
  const [components, setComponents] = useState<ComponentRow[]>(() =>
    recipe?.components.length ? recipe.components.map((row) => ({ ...row, id: crypto.randomUUID() })) : [blankRow()],
  );
  const cost = recipeCost(
    components
      .filter((row) => row.name.trim() || row.quantity.trim())
      .map((row) => ({
        quantity: parseAmount(row.quantity) ?? 0,
        unitPrice: parseAmount(row.unitPrice),
      })),
  );
  const message = error === "recipe" ? dict.admin.errors.recipe : error === "used" ? copy.used : null;

  return (
    <form action={action} className="grid max-w-3xl gap-6">
      <input type="hidden" name="locale" value={locale} />
      {recipe ? <input type="hidden" name="id" value={recipe.id} /> : null}
      {message ? <p className="text-sm text-chili">{message}</p> : null}
      {saved ? <p className="text-sm text-emerald-300">{dict.admin.saved}</p> : null}
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
        {copy.title}
        <input name="title" required maxLength={160} defaultValue={recipe?.title ?? ""} className={fieldClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.product}
          <select name="productId" defaultValue={recipe?.productId ?? ""} className={fieldClass}>
            <option value="">{copy.none}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {dict.admin.status}
          <select name="status" defaultValue={recipe?.status ?? "DRAFT"} className={fieldClass}>
            {(["DRAFT", "TESTING", "APPROVED", "ARCHIVED"] as const).map((status) => (
              <option key={status} value={status}>
                {dict.admin.terminal.recipeStatuses[status]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {recipe ? <p className="text-sm text-[#9c9186]">{copy.version} {recipe.versionNumber}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.meat}
          <select name="meatType" required defaultValue={recipe?.meatType ?? ""} className={fieldClass}>
            <option value="">{copy.choose}</option>
            {meatTypes.map((meat) => (
              <option key={meat} value={meat}>
                {copy.meats[meat]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
          {copy.hours}
          <input name="marinadeHours" inputMode="decimal" defaultValue={recipe?.marinadeHours ?? ""} className={fieldClass} />
        </label>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{copy.marinade}</legend>
        <p className="text-sm normal-case tracking-normal text-[#9c9186]">{copy.costHint}</p>
        <div className="rise grid gap-3">
          {components.map((row) => {
            const amount = lineCost(parseAmount(row.quantity) ?? Number.NaN, parseAmount(row.unitPrice));
            const update = (patch: Partial<ComponentFields>) =>
              setComponents((current) => current.map((item) => (item.id === row.id ? { ...item, ...patch } : item)));
            return (
              <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1.4fr)_110px_100px_140px_120px_auto]">
                <input
                  name="componentName"
                  aria-label={copy.ingredientName}
                  value={row.name}
                  maxLength={160}
                  onChange={(event) => update({ name: event.target.value })}
                  className={fieldClass}
                />
                <input
                  name="componentQty"
                  aria-label={copy.quantity}
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(event) => update({ quantity: event.target.value })}
                  className={fieldClass}
                />
                <select
                  name="componentUnit"
                  aria-label={copy.unit}
                  value={row.unit}
                  onChange={(event) => update({ unit: event.target.value as RecipeUnit })}
                  className={fieldClass}
                >
                  {recipeUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {copy.units[unit]}
                    </option>
                  ))}
                </select>
                <input
                  name="componentPrice"
                  aria-label={copy.unitPrice}
                  inputMode="decimal"
                  value={row.unitPrice}
                  onChange={(event) => update({ unitPrice: event.target.value })}
                  className={fieldClass}
                />
                <span className="self-end px-1 py-2 text-sm text-[#e7d3bc]">
                  {amount == null ? copy.costMissing : formatAmount(amount, locale)}
                </span>
                <button
                  type="button"
                  onClick={() => setComponents((current) => (current.length === 1 ? [blankRow()] : current.filter((item) => item.id !== row.id)))}
                  className="self-end px-3 py-2 text-xs text-[#b7aa9d]"
                >
                  {copy.removeLine}
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setComponents((current) => [...current, blankRow()])}
          className="w-fit text-sm text-[#e7d3bc]"
        >
          {copy.addIngredient}
        </button>
        <p className="text-sm text-[#f3efe6]">
          {copy.recipeCost}: {formatAmount(cost.total, locale)}
          {cost.missing > 0 ? <span className="ml-3 text-[#9c9186]">{copy.costMissing}</span> : null}
        </p>
      </fieldset>

      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
        {copy.process}
        <textarea name="processPlan" rows={4} defaultValue={recipe?.processPlan ?? ""} className={fieldClass} />
      </label>

      <div className="flex flex-wrap gap-3">
        <button name="mode" value="save" className="rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
          {dict.admin.save}
        </button>
        {recipe ? (
          <button name="mode" value="version" className="rounded-lg border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]">
            {copy.saveVersion}
          </button>
        ) : null}
      </div>
    </form>
  );
}
