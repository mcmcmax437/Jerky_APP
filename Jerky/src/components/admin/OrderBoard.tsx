"use client";

import { useRef, useState, useTransition, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { moveOrder } from "@/features/admin/actions";
import { isOrderStatus, orderStatuses, orderStatusTone, type OrderStatusName } from "@/features/admin/order-status";
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

function TicketFace({
  order,
  locale,
  comingSoon,
}: {
  order: OrderTicket;
  locale: Locale;
  comingSoon: string;
}) {
  return (
    <>
      <p className="font-semibold text-[#f3efe6]">{order.number}</p>
      <p className="mt-1 text-sm text-[#d9cfc4]">{order.customerName}</p>
      <p className="mt-2 flex items-center justify-between gap-2 text-xs text-[#9c9186]">
        <span>{order.dateLabel}</span>
        <span className="font-semibold text-[#e7d3bc]">{formatPrice(order.totalMinor, locale, comingSoon)}</span>
      </p>
    </>
  );
}

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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [over, setOver] = useState<OrderStatusName | null>(null);
  const dragId = useRef<string | null>(null);
  const gesture = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const [, startTransition] = useTransition();
  const needle = query.trim().toLocaleLowerCase(locale);
  const visible = items.filter((order) => {
    if (!needle) return true;
    return `${order.number} ${order.customerName}`.toLocaleLowerCase(locale).includes(needle);
  });

  function statusAt(x: number, y: number) {
    const zone = document.elementFromPoint(x, y)?.closest("[data-status]");
    const value = zone?.getAttribute("data-status") ?? "";
    return isOrderStatus(value) ? value : null;
  }

  function dropOn(status: OrderStatusName) {
    const id = dragId.current;
    dragId.current = null;
    setDraggingId(null);
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

  function onPointerDown(event: PointerEvent<HTMLElement>, id: string) {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The gesture still follows pointer events when capture is unavailable.
    }
    gesture.current = { id, x: event.clientX, y: event.clientY, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && dx * dx + dy * dy < 36) return;
    start.moved = true;
    dragId.current = start.id;
    setDraggingId(start.id);
    setOver(statusAt(event.clientX, event.clientY));
  }

  function finishGesture(x: number, y: number) {
    const start = gesture.current;
    gesture.current = null;
    if (!start?.moved) return;
    const status = statusAt(x, y);
    if (status) dropOn(status);
    else {
      dragId.current = null;
      setDraggingId(null);
      setOver(null);
    }
  }

  const dragging = items.find((order) => order.id === draggingId) ?? null;

  function slotsFor(status: OrderStatusName) {
    const column = visible.filter((order) => order.status === status);
    if (!dragging || over !== status || dragging.status === status || !visible.some((order) => order.id === dragging.id)) {
      return column.map((order) => ({ order, ghost: false }));
    }
    const placed = [...column.filter((order) => order.id !== dragging.id), dragging];
    placed.sort((a, b) => items.findIndex((item) => item.id === a.id) - items.findIndex((item) => item.id === b.id));
    return placed.map((order) => ({ order, ghost: order.id === dragging.id }));
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
            const slots = slotsFor(status);
            return (
              <section
                key={status}
                aria-label={labels[status]}
                data-status={status}
                className={`min-h-64 border-r border-white/15 last:border-r-0 select-none ${columnWash[status]}`}
              >
                <header className={`flex items-center justify-between gap-2 px-3 py-3 ${orderStatusTone[status]}`}>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">{labels[status]}</h2>
                  <span className="text-xs tabular-nums">{column.length}</span>
                </header>
                <ul className="grid gap-2 p-2">
                  {slots.map(({ order, ghost }) =>
                    ghost ? (
                      <li key={`${order.id}-projection`}>
                        <div data-projection={order.number} className="rounded-lg border border-dashed border-[#e7d3bc] bg-[#e7d3bc]/10 px-3 py-3">
                          <TicketFace order={order} locale={locale} comingSoon={comingSoon} />
                        </div>
                      </li>
                    ) : (
                      <li key={order.id}>
                        <article
                          role="button"
                          aria-label={order.number}
                          onPointerDown={(event) => onPointerDown(event, order.id)}
                          onPointerMove={onPointerMove}
                          onPointerUp={(event) => finishGesture(event.clientX, event.clientY)}
                          onPointerCancel={() => finishGesture(-1, -1)}
                          onDoubleClick={() => router.push(`/${locale}/admin/orders/${order.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") router.push(`/${locale}/admin/orders/${order.id}`);
                          }}
                          tabIndex={0}
                          className={`cursor-grab rounded-lg bg-black/35 px-3 py-3 ring-inset active:cursor-grabbing ${draggingId === order.id ? "opacity-40 ring-2 ring-[#e7d3bc]" : "ring-1 ring-white/10"}`}
                        >
                          <TicketFace order={order} locale={locale} comingSoon={comingSoon} />
                        </article>
                      </li>
                    ),
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
