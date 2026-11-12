"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin/settings");
  return session;
}

export async function setPanelLocale(formData: FormData) {
  await requireAdmin();
  const requested = String(formData.get("locale") ?? "");
  const target: Locale = isLocale(requested) ? requested : defaultLocale;
  await prisma.adminSetting.upsert({
    where: { key: "panel-locale" },
    update: { value: target },
    create: { key: "panel-locale", value: target },
  });
  redirect(`/${target}/admin/settings?saved=1`);
}

export async function setSiteClosed(formData: FormData) {
  await requireAdmin();
  const locale = String(formData.get("current") ?? "");
  const target = isLocale(locale) ? locale : defaultLocale;
  const closed = String(formData.get("closed") ?? "") === "1";
  await prisma.adminSetting.upsert({
    where: { key: "site-closed" },
    update: { value: closed ? "1" : "0" },
    create: { key: "site-closed", value: closed ? "1" : "0" },
  });
  redirect(`/${target}/admin/settings?saved=1`);
}
