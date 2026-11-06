import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/AdminPage";
import { OrderLines } from "@/components/admin/OrderLines";
import { orderStatusTone, orderStatuses } from "@/features/admin/order-status";
import { addOrderNote, setOrderStatus } from "@/features/admin/actions";
import { getAdminOrder, orderLines } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

const fieldClass = "mt-2 block w-full rounded-lg border border-white/10 bg-[#161412] px-3 py-3 text-base font-normal text-[#f3efe6] normal-case tracking-normal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { dict } = await readLocale(Promise.resolve({ locale }));
  return { title: dict.admin.orders };
}

export default async function AdminOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const { locale, dict } = await readLocale(Promise.resolve({ locale: localeParam }));
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const query = await searchParams;
  const lines = await orderLines(order.items);

  return (
    <AdminPage title={order.number} lede={dict.admin.testBanner}>
      <form action={setOrderStatus} className="flex flex-wrap gap-2">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={order.id} />
        {orderStatuses.map((status) => (
          <button
            key={status}
            name="status"
            value={status}
            disabled={order.status === status}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-100 ${order.status === status ? orderStatusTone[status] : "border border-white/15 text-[#b7aa9d]"}`}
          >
            {dict.admin.statuses[status]}
          </button>
        ))}
      </form>
      <section className="grid gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{dict.admin.detail}</h2>
        <OrderLines lines={lines} dict={dict} />
      </section>
      <section className="grid gap-2 text-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{dict.admin.customer}</h2>
        <p>
          {order.customerName}
          <br />
          {order.email}
          {order.phone ? (
            <>
              <br />
              {order.phone}
            </>
          ) : null}
        </p>
        <p>{[order.addressLine, order.postalCode, order.city, order.country].filter(Boolean).join(", ")}</p>
      </section>
      <section className="grid gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{dict.admin.notes}</h2>
        {query.error === "note" ? <p className="text-sm text-chili">{dict.admin.errors.note}</p> : null}
        <ul className="grid gap-3">
          {order.notes.map((note) => (
            <li key={note.id} className="rounded-lg border border-white/10 p-4">
              <p>{note.body}</p>
              <p className="mt-2 text-sm text-[#9c9186]">{formatDateTime(note.createdAt, locale)}</p>
            </li>
          ))}
        </ul>
        <form action={addOrderNote} className="grid max-w-xl gap-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={order.id} />
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">
            {dict.admin.noteLabel}
            <textarea name="body" required rows={4} className={fieldClass} />
          </label>
          <button type="submit" className="w-fit rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1612]">
            {dict.admin.addNote}
          </button>
        </form>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b7aa9d]">{dict.admin.history}</h2>
        <ol className="mt-4 grid gap-3">
          {order.events.map((event) => (
            <li key={event.id} className="text-sm">
              <span className="font-semibold">
                {event.fromStatus ? `${dict.admin.statuses[event.fromStatus]} → ` : ""}
                {dict.admin.statuses[event.toStatus]}
              </span>
              <span className="ml-3 text-[#9c9186]">{formatDateTime(event.createdAt, locale)}</span>
            </li>
          ))}
        </ol>
      </section>
    </AdminPage>
  );
}
