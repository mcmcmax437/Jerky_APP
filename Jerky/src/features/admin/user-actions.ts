"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin/users");
  return session;
}

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "pl");
  return isLocale(value) ? value : "pl";
}

export async function setUserBan(formData: FormData) {
  const session = await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  const banned = String(formData.get("banned") ?? "") === "1";
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!id || id === session.id) redirect(`/${locale}/admin/users?error=self`);

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user) redirect(`/${locale}/admin/users`);
  if (banned && user.role === "ADMIN") {
    const others = await prisma.user.count({ where: { role: "ADMIN", banned: false, id: { not: id } } });
    if (others < 1) redirect(`/${locale}/admin/users?error=self`);
  }

  await prisma.user.update({
    where: { id },
    data: { banned, banReason: banned && reason ? reason : null },
  });
  if (banned) await prisma.session.deleteMany({ where: { userId: id } });
  redirect(`/${locale}/admin/users`);
}
