import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { listSupportMessages } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.support };
}

export default async function AdminSupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await readLocale(params);
  const messages = await listSupportMessages();
  const copy = dict.admin.terminal;

  return (
    <AdminPage title={copy.support} lede={messages.length === 0 ? copy.supportEmpty : copy.supportLede}>
      {messages.length === 0 ? null : (
        <ul className="grid gap-3">
          {messages.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 px-4 py-3 text-sm">
              <p className="text-[#e7d3bc]">
                {item.name} · {item.email}
              </p>
              <p className="mt-1 text-xs text-[#9c9186]">{formatDate(item.createdAt, locale)}</p>
              <p className="mt-2 whitespace-pre-wrap">{item.body}</p>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
