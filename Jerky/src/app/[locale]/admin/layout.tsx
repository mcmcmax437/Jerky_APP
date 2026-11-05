import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
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

  return (
    <>
      <AdminNav locale={locale} dict={dict} />
      {children}
    </>
  );
}
