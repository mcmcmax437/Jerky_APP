"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { mutateIngredient } from "@/features/admin/ingredient-actions";
import type { IngredientItem } from "@/features/admin/recipe";
import type { Dictionary } from "@/lib/i18n/types";

const inputClass =
  "min-w-0 flex-1 rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm text-[#f3efe6] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8d8278] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

const iconButtonClass =
  "press shrink-0 cursor-pointer rounded-lg border border-white/10 p-1.5 text-[#b7aa9d] hover:text-[#e7d3bc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

export function IngredientsMenu({
  items: initialItems,
  dict,
  onItemsChange,
}: {
  items: IngredientItem[];
  dict: Dictionary;
  onItemsChange?: (items: IngredientItem[]) => void;
}) {
  const copy = dict.admin.terminal.recipe;
  const [items, setItems] = useState<IngredientItem[]>(initialItems);
  const [error, setError] = useState<"fields" | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  const run = (intent: "add" | "rename" | "delete", data: { id?: string; name?: string }) => {
    const formData = new FormData();
    formData.set("intent", intent);
    if (data.id) formData.set("id", data.id);
    if (data.name !== undefined) formData.set("name", data.name);
    startTransition(async () => {
      const next = await mutateIngredient(formData);
      setItems(next.items);
      setError(next.error);
      setAddedId(next.addedId);
      if (next.error) return;
      if (intent === "add" && addRef.current) addRef.current.value = "";
      if (intent === "rename") setEditingId(null);
    });
  };

  const startEdit = (item: IngredientItem) => {
    setEditingId(item.id);
    setDraft(item.name);
  };

  return (
    <details
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.currentTarget.open = false;
          event.currentTarget.querySelector("summary")?.focus();
        }
      }}
    >
      <summary className="press w-fit cursor-pointer list-none rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e7d3bc]">
        {copy.ingredients}
      </summary>
      <div className="absolute right-0 z-30 mt-2 grid w-[min(22rem,calc(100vw-3rem))] gap-3 rounded-xl border border-white/10 bg-[#171310] p-4 shadow-2xl">
        <ul className="grid max-h-60 gap-1 overflow-y-auto text-sm">
          {items.length === 0 ? <li className="text-[#9c9186]">—</li> : null}
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-2 rounded-lg px-1 py-0.5 ${item.id === addedId ? "ingredient-in" : ""}`}
            >
              {editingId === item.id ? (
                <>
                  <input
                    autoFocus
                    value={draft}
                    maxLength={160}
                    aria-label={copy.ingredientName}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") run("rename", { id: item.id, name: draft });
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    aria-label={dict.admin.save}
                    disabled={pending}
                    onClick={() => run("rename", { id: item.id, name: draft })}
                    className={iconButtonClass}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                      <path d="M5 10.5l3.2 3.2L15 6.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={copy.removeLine}
                    onClick={() => setEditingId(null)}
                    className={iconButtonClass}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                      <path d="M6 6l8 8M14 6l-8 8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => startEdit(item)} className="min-w-0 flex-1 truncate text-left">
                    {item.name}
                  </button>
                  <button type="button" aria-label={dict.admin.edit} onClick={() => startEdit(item)} className={iconButtonClass}>
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                      <path d="M4 16h3l8-8-3-3-8 8v3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={copy.removeLine}
                    disabled={pending}
                    onClick={() => run("delete", { id: item.id })}
                    className={iconButtonClass}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                      <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 10h6.4L14 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <input
            ref={addRef}
            aria-label={copy.ingredientName}
            placeholder={copy.example.ingredient}
            maxLength={160}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                run("add", { name: event.currentTarget.value });
              }
            }}
            className={inputClass}
          />
          <button
            type="button"
            aria-label={copy.addIngredient}
            disabled={pending}
            onClick={() => run("add", { name: addRef.current?.value ?? "" })}
            className="press shrink-0 cursor-pointer rounded-lg bg-[#e7d3bc] px-3 py-2 text-sm font-semibold text-[#1a1612] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper"
          >
            +
          </button>
        </div>
        {error === "fields" ? <p className="text-xs text-chili">{dict.admin.errors.fields}</p> : null}
      </div>
    </details>
  );
}
