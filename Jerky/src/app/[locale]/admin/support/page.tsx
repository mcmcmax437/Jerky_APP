import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { sendChatReply } from "@/features/admin/chat-actions";
import { listChatThreads } from "@/features/chat/queries";
import { listSupportMessages } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.chat };
}

export default async function AdminSupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const [threads, messages] = await Promise.all([listChatThreads(), listSupportMessages()]);
  const copy = dict.admin.terminal;

  return (
    <AdminPage title={copy.chat} lede={threads.length === 0 ? copy.chatEmpty : copy.chatLede}>
      {query.error ? (
        <p className="text-sm text-chili">
          {query.error === "message" ? dict.account.errors.message : dict.auth.errors.failed}
        </p>
      ) : null}

      {threads.length === 0 ? null : (
        <ul className="grid gap-4">
          {threads.map((thread) => (
            <li key={thread.id} className="rounded-xl border border-white/10 p-4 text-sm">
              <p className="text-[#e7d3bc]">
                {thread.user?.name ?? copy.chatGuest} · {formatDateTime(thread.createdAt, locale)}
              </p>
              <ul className="mt-2 grid gap-2">
                {thread.messages.map((message) => (
                  <li key={message.id} className="grid gap-1">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#9c9186]">
                      {message.admin ? copy.chatReply : message.author?.name ?? copy.chatGuest} ·{" "}
                      {formatDateTime(message.createdAt, locale)}
                    </p>
                    <p className={`whitespace-pre-wrap ${message.admin ? "text-[#9c9186]" : "text-[#e7d3bc]"}`}>
                      {message.body}
                    </p>
                  </li>
                ))}
              </ul>
              <form action={sendChatReply} className="mt-3 grid gap-2">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="t" value={thread.id} />
                <textarea
                  name="message"
                  rows={3}
                  maxLength={1000}
                  placeholder={copy.chatReply}
                  className="w-full rounded-lg border border-white/10 bg-[#100e0c] px-3 py-2 text-sm placeholder:text-[#8d8278] text-[#d9cfc4]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#e7d3bc] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1612]"
                >
                  {copy.chatReply}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-sm uppercase tracking-[0.16em] text-[#9c9186]">{copy.support}</h2>
      {messages.length === 0 ? <p className="mt-2 text-sm text-[#b7aa9d]">{copy.supportEmpty}</p> : null}
      {messages.length === 0 ? null : (
        <ul className="mt-2 grid gap-3">
          {messages.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 px-4 py-3 text-sm">
              <p className="text-[#e7d3bc]">
                {item.name} · {item.email}
              </p>
              <p className="mt-1 text-xs text-[#9c9186]">{formatDateTime(item.createdAt, locale)}</p>
              <p className="mt-2 whitespace-pre-wrap">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
