import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { logoutAccount } from "@/features/auth/actions";
import { getSession } from "@/features/auth/session";
import { listAccountOrders } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.account.title, description: dict.account.lede };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const session = await getSession();
  if (!session) redirect(`/${locale}/login?next=/${locale}/account`);
  if (session.role === "ADMIN") redirect(`/${locale}/admin`);
  const orders = await listAccountOrders(session.id, session.email);

  return (
    <>
      <PageIntro eyebrow={dict.account.eyebrow} title={session.name} lede={dict.account.lede} />
      <PageBody>
        <p>
          {session.email}
          <span className="ml-3 text-sm uppercase tracking-[0.16em] text-text-dark/70">
            {dict.account.customer}
          </span>
        </p>
        <div className="flex flex-wrap gap-4">
          <form action={logoutAccount}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="border border-ink-800/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]">
              {dict.auth.logout}
            </button>
          </form>
        </div>
        <h2 className="font-display text-4xl">{dict.account.orders}</h2>
        {orders.length === 0 ? <p>{dict.account.empty}</p> : null}
        <ul className="divide-y divide-ink-800/10 border-y border-ink-800/10">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/${locale}/order-confirmation/${order.id}`} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
                <span className="font-semibold">{order.number}</span>
                <span>{order.isTest ? dict.account.test : dict.admin.statuses[order.status]}</span>
                <span className="text-sm text-text-dark/70">{formatDateTime(order.createdAt, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageBody>
    </>
  );
}
