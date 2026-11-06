"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Price } from "@/components/product/Price";
import { reorderProducts } from "@/features/admin/actions";
import { moveShopItem } from "@/features/admin/slots";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  photo: string | null;
  priceMinor: number | null;
  published: boolean;
};

function SlotMark({ slot }: { slot: number | null }) {
  return (
    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-[#3c2e24] px-1.5 text-xs font-semibold tabular-nums text-[#efd3b6]">
      {slot ?? "—"}
    </span>
  );
}

export function ProductBoard({
  locale,
  dict,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  products: AdminProductRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<"rows" | "cards">("rows");
  const [shop, setShop] = useState(() => products.filter((item) => item.published));
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);
  const overRef = useRef<string | null>(null);
  const shopRef = useRef(shop);
  shopRef.current = shop;
  const rest = products.filter((item) => !item.published);
  const rows = [...shop, ...rest];

  useEffect(() => {
    setShop(products.filter((item) => item.published));
  }, [products]);

  function slotOf(id: string) {
    const index = shop.findIndex((item) => item.id === id);
    return index < 0 ? null : index + 1;
  }

  function finishDrag() {
    const from = dragRef.current;
    const to = overRef.current;
    dragRef.current = null;
    overRef.current = null;
    setDragId(null);
    setOverId(null);
    if (!from || !to || from === to) return;
    const next = moveShopItem(shopRef.current, from, to);
    shopRef.current = next;
    setShop(next);
    startTransition(async () => {
      await reorderProducts(next.map((item) => item.id));
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["rows", "cards"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                view === item ? "bg-[#e7d3bc] text-[#1a1612]" : "border border-white/15 text-[#e7d3bc]"
              }`}
            >
              {item === "rows" ? dict.admin.viewRows : dict.admin.viewCards}
            </button>
          ))}
        </div>
        {view === "cards" ? <p className="text-sm text-[#b7aa9d]">{dict.admin.dragHint}</p> : null}
      </div>

      {view === "rows" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs tracking-[0.16em] text-[#9c9186] uppercase">
                <th className="py-3 pr-4 font-semibold">{dict.admin.sort}</th>
                <th className="py-3 pr-4 font-semibold">{dict.auth.name}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.slug}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.price}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.published}</th>
                <th className="py-3 font-semibold">
                  <span className="sr-only">{dict.admin.editAction}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr key={product.id} className="border-b border-white/10">
                  <td className="py-3 pr-4">
                    <SlotMark slot={slotOf(product.id)} />
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/${locale}/admin/products/${product.id}`} className="flex items-center gap-3 font-semibold text-[#e7d3bc]">
                      {product.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.photo} alt="" className="h-14 w-11 object-cover" />
                      ) : null}
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{product.slug}</td>
                  <td className="py-3 pr-4">
                    <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                  </td>
                  <td className="py-3 pr-4">{product.published ? dict.admin.published : dict.admin.notInShop}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/${locale}/admin/products/${product.id}`}
                      className="inline-flex rounded-lg bg-[#e7d3bc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1612]"
                    >
                      {dict.admin.editAction}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`grid gap-5 md:grid-cols-3 ${pending ? "opacity-80" : ""}`}>
          {shop.map((product) => (
            <article
              key={product.id}
              data-product-id={product.id}
              draggable
              onDragStart={(event) => {
                if ((event.target as HTMLElement).closest("a")) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.setData("text/plain", product.id);
                event.dataTransfer.effectAllowed = "move";
                dragRef.current = product.id;
                setDragId(product.id);
              }}
              onDragOver={(event) => {
                if (!dragRef.current || dragRef.current === product.id) return;
                event.preventDefault();
                overRef.current = product.id;
                setOverId(product.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
              }}
              onDragEnd={finishDrag}
              className={`cursor-grab touch-none bg-[#161311] text-[#f3efe6] active:cursor-grabbing ${
                dragId === product.id ? "opacity-70" : ""
              } ${overId === product.id ? "outline outline-2 outline-[#e7d3bc]" : ""}`}
            >
              <div className="flex items-center gap-3 p-3">
                <SlotMark slot={slotOf(product.id)} />
                <h2 className="font-display text-3xl leading-none">{product.name}</h2>
              </div>
              <div className="aspect-[3/4] overflow-hidden bg-black">
                {product.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.photo} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3 p-4 text-sm">
                <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                <Link href={`/${locale}/admin/products/${product.id}`} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e7d3bc]">
                  {dict.admin.editAction}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {view === "cards" && rest.length > 0 ? (
        <ul className="grid gap-2">
          {rest.map((product) => (
            <li key={product.id} className="text-sm text-[#b7aa9d]">
              <Link href={`/${locale}/admin/products/${product.id}`} className="text-[#e7d3bc]">
                {product.name}
              </Link>{" "}
              · {dict.admin.notInShop}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
