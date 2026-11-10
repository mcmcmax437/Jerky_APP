"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { hashPassword } from "@/features/auth/password";
import { randomBytes } from "node:crypto";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin/users");
  return session;
}

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "pl");
  return isLocale(value) ? value : "pl";
}

/** Readable alphabet: no `l`, `i`, `1`, `0`, `O`. */
const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function randomPassword(length = 14) {
  const bytes = await randomBytes(length * 4);
  const limit = 256 - (256 % alphabet.length);
  let out = "";
  for (const byte of bytes) {
    if (byte >= limit) continue;
    out += alphabet[byte % alphabet.length];
    if (out.length >= length) break;
  }
  return out;
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

export async function generateUserPassword(formData: FormData) {
  const session = await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  if (!id || id === session.id) redirect(`/${locale}/admin/users?error=self`);

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user) redirect(`/${locale}/admin/users?error=unknown`);
  if (user.role === "ADMIN") redirect(`/${locale}/admin/users?error=self`);

  const password = await randomPassword();
  await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  await prisma.adminSetting.upsert({
    where: { key: `password:${id}` },
    update: { value: password },
    create: { key: `password:${id}`, value: password },
  });
  redirect(`/${locale}/admin/users?password=1`);
}
