"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
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
  const startOrder = useRef<string[] | null>(null);
  const positions = useRef(new Map<string, DOMRect>());
  const shopRef = useRef(shop);
  shopRef.current = shop;
  const rest = products.filter((item) => !item.published);
  const rows = [...shop, ...rest];

  useEffect(() => {
    setShop(products.filter((item) => item.published));
  }, [products]);

  useLayoutEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-product-id]");
    nodes.forEach((node) => {
      const id = node.dataset.productId;
      if (!id) return;
      const next = node.getBoundingClientRect();
      const previous = positions.current.get(id);
      if (previous) {
        const dx = previous.left - next.left;
        const dy = previous.top - next.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          node.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
            { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
          );
        }
      }
      positions.current.set(id, next);
    });
  }, [shop]);

  function slotOf(id: string) {
    const index = shop.findIndex((item) => item.id === id);
    return index < 0 ? null : index + 1;
  }

  function finishDrag() {
    const started = startOrder.current;
    dragRef.current = null;
    overRef.current = null;
    startOrder.current = null;
    setDragId(null);
    setOverId(null);
    const next = shopRef.current;
    if (!started || next.map((item) => item.id).join() === started.join()) return;
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
              className={`press rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
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
            <tbody className="rise-rows">
              {rows.map((product) => (
                <tr key={product.id} className="border-b border-white/10">
                  <td className="py-3 pr-4">
                    <SlotMark slot={slotOf(product.id)} />
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/${locale}/admin/products/${product.id}`} className="flex items-center gap-3 font-semibold text-[#e7d3bc]">
                      {product.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.photo} alt="" className="h-16 w-12 object-cover" />
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
                      className="press inline-flex rounded-lg bg-[#e7d3bc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1612]"
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
        <div className={`rise grid max-w-6xl gap-8 md:grid-cols-3 ${pending ? "opacity-80" : ""}`}>
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
                startOrder.current = shopRef.current.map((item) => item.id);
                setDragId(product.id);
              }}
              onDragOver={(event) => {
                const from = dragRef.current;
                if (!from || from === product.id || overRef.current === product.id) return;
                event.preventDefault();
                overRef.current = product.id;
                setOverId(product.id);
                setShop((current) => {
                  const next = moveShopItem(current, from, product.id);
                  shopRef.current = next;
                  return next;
                });
              }}
              onDragLeave={(event) => {
                const next = event.relatedTarget;
                if (next instanceof Node && event.currentTarget.contains(next)) return;
                if (overRef.current === product.id) overRef.current = null;
              }}
              onDrop={(event) => {
                event.preventDefault();
              }}
              onDragEnd={finishDrag}
              className={`cursor-grab text-[#f3efe6] transition-opacity duration-200 active:cursor-grabbing ${
                dragId === product.id ? "opacity-50" : ""
              } ${overId === product.id ? "outline outline-1 outline-[#e7d3bc]" : ""}`}
            >
              <div className="aspect-[3/4] overflow-hidden bg-black">
                {product.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.photo} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex items-center gap-2 pt-4">
                <SlotMark slot={slotOf(product.id)} />
                <h2 className="truncate font-display text-[28px] leading-none font-medium md:text-[34px]">{product.name}</h2>
              </div>
              <div className="flex items-center justify-between gap-2 pt-3 text-sm">
                <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                <Link href={`/${locale}/admin/products/${product.id}`} className="press inline-block text-[13px] font-semibold uppercase tracking-[1.5px] text-[#e7d3bc]">
                  {dict.admin.editAction}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {view === "cards" && rest.length > 0 ? (
        <ul className="rise grid gap-2">
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
