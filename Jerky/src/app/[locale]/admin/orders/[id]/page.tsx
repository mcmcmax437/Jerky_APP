import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { Price } from "@/components/product/Price";
import { addOrderNote, setOrderStatus } from "@/features/admin/actions";
import { getAdminOrder } from "@/features/admin/queries";
import { formatDateTime, formatWeight } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

const statuses = ["NEW", "CONFIRMED", "PREPARING", "READY", "SHIPPED", "COMPLETED", "CANCELLED", "REFUNDED"] as const;

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

  return (
    <>
      <PageIntro eyebrow={dict.admin.overviewEyebrow} title={order.number} lede={dict.admin.testBanner} />
      <PageBody>
        <dl className="grid max-w-xl gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="uppercase tracking-[0.16em]">{dict.admin.status}</dt>
            <dd>{dict.admin.statuses[order.status]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="uppercase tracking-[0.16em]">{dict.order.status}</dt>
            <dd>{order.isTest ? dict.account.test : dict.admin.statuses[order.status]}</dd>
          </div>
        </dl>
        <section>
          <h2 className="font-display text-4xl">{dict.admin.customer}</h2>
          <p className="mt-3">
            {order.customerName}
            <br />
            {order.email}
            {order.phone ? <><br />{order.phone}</> : null}
          </p>
          {order.user ? <p className="mt-2 text-sm text-text-dark/70">{order.user.email}</p> : null}
        </section>
        <section>
          <h2 className="font-display text-4xl">{dict.admin.address}</h2>
          <p className="mt-3">
            {[order.addressLine, order.postalCode, order.city, order.country].filter(Boolean).join(", ")}
          </p>
        </section>
        <section>
          <h2 className="font-display text-4xl">{dict.admin.items}</h2>
          <ul className="mt-4 divide-y divide-ink-800/10 border-y border-ink-800/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-display text-3xl">{item.name}</p>
                  <p className="text-sm text-text-dark/70">
                    {formatWeight(item.netWeightG, locale)} · {item.quantity}
                  </p>
                </div>
                <Price amountMinor={item.lineTotalMinor} locale={locale} comingSoon={dict.price.comingSoon} />
              </li>
            ))}
          </ul>
        </section>
        <form action={setOrderStatus} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={order.id} />
          <label className="text-xs font-semibold uppercase tracking-[0.16em]">
            {dict.admin.status}
            <select name="status" defaultValue={order.status} className="mt-2 block border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base font-normal normal-case tracking-normal">
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {dict.admin.statuses[status]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="bg-ink-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-light">
            {dict.admin.saveStatus}
          </button>
        </form>
        <section className="grid gap-4">
          <h2 className="font-display text-4xl">{dict.admin.notes}</h2>
          {query.error === "note" ? <p className="text-sm text-chili">{dict.admin.errors.note}</p> : null}
          <ul className="grid gap-3">
            {order.notes.map((note) => (
              <li key={note.id} className="border border-ink-800/10 p-4">
                <p>{note.body}</p>
                <p className="mt-2 text-sm text-text-dark/70">{formatDateTime(note.createdAt, locale)}</p>
              </li>
            ))}
          </ul>
          <form action={addOrderNote} className="grid max-w-xl gap-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={order.id} />
            <label className="text-xs font-semibold uppercase tracking-[0.16em]">
              {dict.admin.noteLabel}
              <textarea name="body" required rows={4} className="mt-2 w-full border border-ink-800/15 bg-ivory-100 px-3 py-3 text-base font-normal normal-case tracking-normal" />
            </label>
            <button type="submit" className="w-fit bg-ink-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-light">
              {dict.admin.addNote}
            </button>
          </form>
        </section>
        <section>
          <h2 className="font-display text-4xl">{dict.admin.history}</h2>
          <ol className="mt-4 grid gap-3">
            {order.events.map((event) => (
              <li key={event.id} className="text-sm">
                <span className="font-semibold">
                  {event.fromStatus ? `${dict.admin.statuses[event.fromStatus]} → ` : ""}
                  {dict.admin.statuses[event.toStatus]}
                </span>
                <span className="ml-3 text-text-dark/70">{formatDateTime(event.createdAt, locale)}</span>
                {event.note ? <span className="mt-1 block">{event.note}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      </PageBody>
    </>
  );
}
