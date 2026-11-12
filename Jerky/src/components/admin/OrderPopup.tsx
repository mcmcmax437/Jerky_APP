"use client";

import { useEffect, useState } from "react";
import { OrderLines } from "@/components/admin/OrderLines";
import { moveOrder, readOrderPopup, saveOrderNote, type OrderPopupData } from "@/features/admin/actions";
import { orderStatuses, orderStatusTone, type OrderStatusName } from "@/features/admin/order-status";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

const fieldClass = "mt-2 block w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-3 text-base font-normal text-[#f3efe6] normal-case tracking-normal placeholder:text-[#8d8278]";

export function OrderPopup({
  id,
  locale,
  dict,
  onClose,
  onStatus,
}: {
  id: string;
  locale: Locale;
  dict: Dictionary;
  onClose: () => void;
  onStatus: (status: OrderStatusName) => void;
}) {
  const [detail, setDetail] = useState<OrderPopupData | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [reload, setReload] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const copy = dict.admin;

  useEffect(() => {
    let live = true;
    readOrderPopup(id, locale).then((next) => {
      if (live) setDetail(next);
    });
    return () => {
      live = false;
    };
  }, [id, locale, reload]);

  useEffect(() => {
    setHistoryOpen(false);
  }, [id]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function chooseStatus(status: OrderStatusName) {
    if (!detail || detail.status === status) return;
    const saved = await moveOrder(id, status);
    if (!saved) return;
    onStatus(status);
    setReload((value) => value + 1);
  }

  async function addNote() {
    const saved = await saveOrderNote(id, note);
    if (!saved) {
      setNoteError(true);
      return;
    }
    setNote("");
    setNoteError(false);
    setReload((value) => value + 1);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 animate-[fade-in_180ms_ease-out]" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-popup-title"
        onClick={(event) => event.stopPropagation()}
        className="grid max-h-[min(90vh,880px)] w-full max-w-2xl gap-6 overflow-y-auto rounded-xl border border-white/15 bg-[#161412] p-5 text-[#f3efe6] shadow-2xl animate-[cart-pop-in_220ms_cubic-bezier(0.22,1,0.36,1)]"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="order-popup-title" className="font-display text-3xl leading-none">{detail?.number ?? "…"}</h2>
            <p className="mt-2 text-sm text-[#b7aa9d]">{copy.testBanner}</p>
          </div>
          <button type="button" onClick={onClose} className="press rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#e7d3bc]">
            {dict.cart.close}
          </button>
        </header>
        {detail ? (
          <>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={detail.status === status}
                  onClick={() => chooseStatus(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-100 ${detail.status === status ? orderStatusTone[status] : "border border-white/15 text-[#b7aa9d]"}`}
                >
                  {copy.statuses[status]}
                </button>
              ))}
            </div>
            <section className="grid gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{copy.detail}</h3>
              <OrderLines lines={detail.lines} dict={dict} />
            </section>
            <section className="grid gap-2 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{copy.customer}</h3>
              <p>
                {detail.customerName}
                <br />
                {detail.email}
                {detail.phone ? (
                  <>
                    <br />
                    {detail.phone}
                  </>
                ) : null}
              </p>
              {detail.address ? <p>{detail.address}</p> : null}
            </section>
            <section className="grid gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{copy.notes}</h3>
              {noteError ? <p className="text-sm text-chili">{copy.errors.note}</p> : null}
              <ul className="grid gap-3">
                {detail.notes.map((item) => (
                  <li key={item.id} className="rounded-lg border border-white/10 p-4">
                    <p>{item.body}</p>
                    <p className="mt-2 text-sm text-[#9c9186]">{item.at}</p>
                  </li>
                ))}
              </ul>
              <label className="grid max-w-xl gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
                {copy.noteLabel}
                <textarea
                  value={note}
                  required
                  rows={4}
                  placeholder={copy.noteExample}
                  onChange={(event) => setNote(event.target.value)}
                  className={fieldClass}
                />
                <button type="button" onClick={addNote} className="w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
                  {copy.addNote}
                </button>
              </label>
            </section>
            <section>
              <button
                type="button"
                aria-expanded={historyOpen}
                onClick={() => setHistoryOpen((open) => !open)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]"
              >
                {copy.history}
                <span className="tabular-nums">{detail.events.length}</span>
                <span aria-hidden="true">{historyOpen ? "−" : "+"}</span>
              </button>
              {historyOpen ? (
                <ol className="mt-4 grid gap-3">
                  {detail.events.map((event) => (
                    <li key={event.id} className="text-sm">
                      <span className="font-semibold">
                        {event.fromStatus ? `${copy.statuses[event.fromStatus]} → ` : ""}
                        {copy.statuses[event.toStatus]}
                      </span>
                      <span className="ml-3 text-[#9c9186]">{event.at}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>
          </>
        ) : null}
      </section>
    </div>
  );
}
