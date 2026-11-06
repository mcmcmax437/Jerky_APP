import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { countNewOrders } from "@/features/admin/queries";
import { getSession } from "@/features/auth/session";
import { readLocale } from "@/lib/i18n/request";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const session = await getSession();
  if (!session) redirect(`/${locale}/login?next=/${locale}/admin`);
  if (session.role !== "ADMIN") redirect(`/${locale}/account`);
  const newOrders = await countNewOrders();

  return (
    <AdminShell locale={locale} dict={dict} name={session.name} newOrders={newOrders}>
      {children}
    </AdminShell>
  );
}
