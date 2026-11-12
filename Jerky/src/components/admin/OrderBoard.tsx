"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveOrder } from "@/features/admin/actions";
import { orderStatuses, orderStatusTone, type OrderStatusName } from "@/features/admin/order-status";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";

const columnWash: Record<OrderStatusName, string> = {
  NEW: "bg-[#221e19]",
  IN_PROCESS: "bg-[#2c1d14]",
  READY: "bg-[#3a2614]",
  PACKING: "bg-[#2a2116]",
  SHIPPED: "bg-[#152430]",
  DELIVERED: "bg-[#12261e]",
  CANCELLED: "bg-[#2e1614]",
};

export type OrderTicket = {
  id: string;
  number: string;
  status: OrderStatusName;
  customerName: string;
  totalMinor: number | null;
  dateLabel: string;
};

export function OrderBoard({
  locale,
  orders,
  labels,
  searchLabel,
  emptyLabel,
  comingSoon,
}: {
  locale: Locale;
  orders: OrderTicket[];
  labels: Record<OrderStatusName, string>;
  searchLabel: string;
  emptyLabel: string;
  comingSoon: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(orders);
  const [query, setQuery] = useState("");
  const [over, setOver] = useState<OrderStatusName | null>(null);
  const dragId = useRef<string | null>(null);
  const dragged = useRef(false);
  const [, startTransition] = useTransition();
  const needle = query.trim().toLocaleLowerCase(locale);
  const visible = items.filter((order) => {
    if (!needle) return true;
    return `${order.number} ${order.customerName}`.toLocaleLowerCase(locale).includes(needle);
  });

  function dropOn(status: OrderStatusName) {
    const id = dragId.current;
    dragId.current = null;
    setOver(null);
    if (!id) return;
    const current = items.find((order) => order.id === id);
    if (!current || current.status === status) return;
    const previous = current.status;
    setItems((list) => list.map((order) => (order.id === id ? { ...order, status } : order)));
    startTransition(async () => {
      const saved = await moveOrder(id, status);
      if (!saved) {
        setItems((list) => list.map((order) => (order.id === id ? { ...order, status: previous } : order)));
      }
    });
  }

  return (
    <div className="grid gap-4">
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
        {searchLabel}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 block w-full max-w-sm rounded-lg border border-white/10 bg-[#161412] px-3 py-3 text-base font-normal text-[#f3efe6] normal-case tracking-normal"
        />
      </label>
      {items.length === 0 ? <p>{emptyLabel}</p> : null}
      <div className="overflow-x-auto">
        <div className="grid w-max min-w-full grid-flow-col auto-cols-[minmax(220px,1fr)] overflow-hidden rounded-xl border border-white/15">
          {orderStatuses.map((status) => {
            const column = visible.filter((order) => order.status === status);
            return (
              <section
                key={status}
                aria-label={labels[status]}
                onDragOver={(event) => {
                  event.preventDefault();
                  setOver(status);
                }}
                onDragLeave={() => setOver((current) => (current === status ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  dropOn(status);
                }}
                className={`min-h-64 border-r border-white/15 last:border-r-0 ${columnWash[status]} ${over === status ? "ring-2 ring-[#e7d3bc] ring-inset" : ""}`}
              >
                <header className={`flex items-center justify-between gap-2 px-3 py-3 ${orderStatusTone[status]}`}>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">{labels[status]}</h2>
                  <span className="text-xs tabular-nums">{column.length}</span>
                </header>
                <ul className="grid gap-2 p-2">
                  {column.map((order) => (
                    <li key={order.id}>
                      <article
                        role="button"
                        aria-label={order.number}
                        draggable
                        onDragStart={() => {
                          dragId.current = order.id;
                          dragged.current = true;
                        }}
                        onDragEnd={() => {
                          setOver(null);
                          window.setTimeout(() => {
                            dragged.current = false;
                          }, 0);
                        }}
                        onDoubleClick={() => {
                          if (dragged.current) return;
                          router.push(`/${locale}/admin/orders/${order.id}`);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") router.push(`/${locale}/admin/orders/${order.id}`);
                        }}
                        tabIndex={0}
                        className="cursor-grab rounded-lg bg-black/35 px-3 py-3 ring-1 ring-white/10 ring-inset active:cursor-grabbing"
                      >
                        <p className="font-semibold text-[#f3efe6]">{order.number}</p>
                        <p className="mt-1 text-sm text-[#d9cfc4]">{order.customerName}</p>
                        <p className="mt-2 flex items-center justify-between gap-2 text-xs text-[#9c9186]">
                          <span>{order.dateLabel}</span>
                          <span className="font-semibold text-[#e7d3bc]">{formatPrice(order.totalMinor, locale, comingSoon)}</span>
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
