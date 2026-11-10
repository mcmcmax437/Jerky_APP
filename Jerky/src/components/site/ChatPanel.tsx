"use client";

import { Icon } from "@/components/brand/Icon";
import { Honeypot } from "@/components/security/Honeypot";
import { useEffect, useState } from "react";
import { sendChatMessage } from "@/features/chat/actions";
import { localeTag, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";

type Message = { id: string; body: string; admin: boolean; author: string; at: string };

const pollMs = 5000;

function toMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { id?: unknown; body?: unknown; admin?: unknown; author?: unknown; at?: unknown };
    if (typeof row.id !== "string" || typeof row.body !== "string") return [];
    return [
      {
        id: row.id,
        body: row.body,
        admin: row.admin === true,
        author: typeof row.author === "string" ? row.author : "",
        at: typeof row.at === "string" ? row.at : "",
      },
    ];
  });
}

export function ChatPanel({
  id,
  locale,
  copy,
  notice,
}: {
  id: string;
  locale: Locale;
  copy: Dictionary["chat"];
  notice: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const answer = await fetch(`/api/chat/${id}`, { cache: "no-store" });
        if (!answer.ok) return;
        const payload = await answer.json();
        setMessages(toMessages(payload?.messages));
      } catch {
        // A failed poll must not break the page. The next one may work.
      }
    }

    void load();
    const timer = setInterval(load, pollMs);
    return () => void clearInterval(timer);
  }, [id]);

  const clock = new Intl.DateTimeFormat(localeTag(locale), { timeStyle: "short" });

  function timeOf(at: string) {
    if (!at) return "";
    try {
      return clock.format(new Date(at));
    } catch {
      return "";
    }
  }

  // A visitor has no name, so an unnamed message shows only its time.
  function labelOf(item: Message) {
    const time = timeOf(item.at);
    if (item.author && time) return `${item.author} · ${time}`;
    return item.author || time;
  }

  return (
    <section>
      <div className="grid gap-3">
        {notice ? <p className="text-sm text-chili">{notice}</p> : null}
        {messages.length === 0 ? (
          <p className="text-sm text-text-dark/60">{copy.empty}</p>
        ) : (
          <ul className="grid gap-3">
            {messages.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl px-4 py-3 text-sm ${
                  item.admin ? "border border-copper/40 bg-copper/10" : "border border-ink-800/12 bg-white/70"
                }`}
              >
                <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-text-dark/60">
                  {item.admin ? <Icon name="shield-01" size={14} /> : null}
                  {labelOf(item)}
                </p>
                <p className="mt-1 whitespace-pre-wrap">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {closed ? (
        <p className="mt-4 text-sm text-text-dark/60">{copy.live}</p>
      ) : (
        <form
          action={sendChatMessage}
          className="relative grid gap-4 rounded-2xl border border-ink-800/10 bg-white/70 p-5"
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="t" value={id} />
          <label className="block" htmlFor="chat-question">
            <span className="text-[13px] font-semibold uppercase tracking-[1.5px]">{copy.placeholder}</span>
            <textarea
              id="chat-question"
              name="message"
              rows={4}
              maxLength={1000}
              placeholder={copy.placeholder}
              className="mt-2 w-full rounded-xl border border-ink-800/15 bg-white px-3 py-3 text-base text-text-dark outline-none placeholder:text-text-dark/40 focus-visible:border-ink-800"
            />
          </label>
          <Honeypot id="chat-company" value="" onChange={() => {}} />
          <button
            type="submit"
            className="press w-fit bg-[#c4a574] px-6 py-3 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#2a241f]"
          >
            {copy.send}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => setClosed(true)}
        className="press w-fit rounded-full border border-ink-800/20 px-4 py-2 text-xs font-semibold uppercase tracking-[1.5px] text-text-dark/70"
      >
        {copy.close}
      </button>
    </section>
  );
}
