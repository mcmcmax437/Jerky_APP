"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isLocale } from "@/lib/i18n/locales";
import { hashPassword, verifyPassword } from "./password";
import { clearSession, createSession, safeNext } from "./session";

const registerSchema = z.object({
  locale: z.enum(["pl", "uk", "en"]),
  name: z.string().trim().min(2).max(160),
  email: z.email().max(190),
  password: z.string().min(8).max(128),
  confirm: z.string(),
  next: z.string().optional(),
});

const loginSchema = z.object({
  locale: z.enum(["pl", "uk", "en"]),
  email: z.email().max(190),
  password: z.string().min(1).max(128),
  next: z.string().optional(),
});

export type AuthField = "name" | "email" | "password" | "confirm" | "credentials" | "taken" | "failed";

export type AuthResult = { ok: true; href: string } | { ok: false; field: AuthField };

function fieldFrom(path: PropertyKey | undefined): AuthField {
  if (path === "name" || path === "email" || path === "password" || path === "confirm") return path;
  return "credentials";
}

export async function registerAccount(input: unknown): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: fieldFrom(parsed.error.issues[0]?.path[0]) };
  const data = parsed.data;
  if (data.password !== data.confirm) return { ok: false, field: "confirm" };

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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    return { ok: false, field: "credentials" };
  }
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
