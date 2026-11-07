"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/features/auth/password";
import { getSession } from "@/features/auth/session";

export type AccountField = "name" | "email" | "password" | "confirm" | "current" | "message" | "taken" | "failed";

export type AccountResult = { ok: true } | { ok: false; field: AccountField };

const nameSchema = z.object({
  name: z.string().trim().min(2).max(160),
});

const emailSchema = z.object({
  email: z.email().max(190),
  current: z.string().min(1).max(128),
});

const passwordSchema = z.object({
  current: z.string().min(1).max(128),
  password: z.string().min(8).max(128),
  confirm: z.string(),
});

const messageSchema = z.object({
  message: z.string().trim().min(2).max(2000),
});

async function currentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id } });
}

export async function updateAccountName(input: unknown): Promise<AccountResult> {
  const parsed = nameSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: "name" };
  const user = await currentUser();
  if (!user) return { ok: false, field: "failed" };
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  return { ok: true };
}

export async function updateAccountEmail(input: unknown): Promise<AccountResult> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: parsed.error.issues[0]?.path[0] === "current" ? "current" : "email" };
  const user = await currentUser();
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) return { ok: false, field: "current" };
  const email = parsed.data.email.toLowerCase();
  if (email === user.email) return { ok: true };
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, field: "taken" };
  await prisma.user.update({ where: { id: user.id }, data: { email } });
  return { ok: true };
}

export async function updateAccountPassword(input: unknown): Promise<AccountResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    const key = parsed.error.issues[0]?.path[0];
    if (key === "current" || key === "password") return { ok: false, field: key };
    return { ok: false, field: "password" };
  }
  if (parsed.data.password !== parsed.data.confirm) return { ok: false, field: "confirm" };
  const user = await currentUser();
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) return { ok: false, field: "current" };
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  return { ok: true };
}

export async function sendSupportMessage(input: unknown): Promise<AccountResult> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, field: "message" };
  const user = await currentUser();
  if (!user) return { ok: false, field: "failed" };
  await prisma.supportMessage.create({
    data: {
      userId: user.id,
      name: user.name,
      email: user.email,
      body: parsed.data.message,
    },
  });
  return { ok: true };
}
