"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isLocale } from "@/lib/i18n/locales";
import { buckets, clearLimit, clientAddress, isLocked, isSpamTrap, take } from "@/lib/security/limit";
import { hashPassword, unknownPasswordHash, verifyPassword } from "./password";
import { clearSession, createSession, safeNext } from "./session";

const registerSchema = z.object({
  locale: z.enum(["pl", "uk", "en"]),
  name: z.string().trim().min(2).max(160),
  email: z.email().max(190),
  password: z.string().min(8).max(128),
  confirm: z.string(),
  next: z.string().optional(),
  company: z.string().max(200).optional(),
});

const loginSchema = z.object({
  locale: z.enum(["pl", "uk", "en"]),
  email: z.email().max(190),
  password: z.string().min(1).max(128),
  next: z.string().optional(),
  company: z.string().max(200).optional(),
});

export type AuthField = "name" | "email" | "password" | "confirm" | "credentials" | "taken" | "failed" | "banned" | "locked";

export type AuthResult = { ok: true; href: string } | { ok: false; field: AuthField };

function fieldFrom(path: PropertyKey | undefined): AuthField {
  if (path === "name" || path === "email" || path === "password" || path === "confirm") return path;
  return "credentials";
}

export async function registerAccount(input: unknown): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: fieldFrom(parsed.error.issues[0]?.path[0]) };
  const data = parsed.data;
  const allowed = await take("register-ip", await clientAddress(), buckets.registerIp);
  if (!allowed) return { ok: false, field: "locked" };
  if (data.password !== data.confirm) return { ok: false, field: "confirm" };
  if (isSpamTrap(data.company)) return { ok: false, field: "failed" };

  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, field: "taken" };

  const user = await prisma.user.create({
    data: {
      email,
      name: data.name,
      passwordHash: await hashPassword(data.password),
      role: "CUSTOMER",
    },
  });
  await createSession(user.id);
  return { ok: true, href: safeNext(data.next, `/${data.locale}/account`) };
}

export async function loginAccount(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: fieldFrom(parsed.error.issues[0]?.path[0]) };
  const data = parsed.data;
  const email = data.email.toLowerCase();
  const ip = await clientAddress();
  if ((await isLocked("login-email", email)) || (await isLocked("login-ip", ip))) {
    return { ok: false, field: "locked" };
  }
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await verifyPassword(data.password, user?.passwordHash ?? unknownPasswordHash);
  if (!user || !passwordMatches || isSpamTrap(data.company)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const emailAllowed = await take("login-email", email, buckets.loginEmail);
    const ipAllowed = await take("login-ip", ip, buckets.loginIp);
    return { ok: false, field: emailAllowed && ipAllowed ? "credentials" : "locked" };
  }
  if (user.banned) return { ok: false, field: "banned" };
  await clearLimit("login-email", email);
  await createSession(user.id);
  const fallback = user.role === "ADMIN" ? `/${data.locale}/admin` : `/${data.locale}/account`;
  return { ok: true, href: safeNext(data.next, fallback) };
}

export async function logoutAccount(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "pl");
  const locale = isLocale(localeValue) ? localeValue : "pl";
  await clearSession();
  redirect(`/${locale}`);
}
