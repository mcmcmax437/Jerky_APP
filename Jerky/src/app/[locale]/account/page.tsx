import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountHome } from "@/components/account/AccountHome";
import { getSession } from "@/features/auth/session";
import { listAccountOrders } from "@/features/admin/queries";
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
    <AccountHome
      locale={locale}
      dict={dict}
      name={session.name}
      email={session.email}
      orders={orders}
    />
  );
}
