"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";

async function requireAdmin(locale: Locale) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect(`/pl/login?next=/${locale}/admin/support`);
  return session;
}

export async function sendChatReply(formData: FormData) {
  const requested = String(formData.get("locale") ?? "pl");
  const locale: Locale = isLocale(requested) ? requested : "pl";
  const session = await requireAdmin(locale);

  const threadId = String(formData.get("t") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!/^[0-9a-z]{20,40}$/.test(threadId) || message.length < 2 || message.length > 1000) {
    redirect(`/${locale}/admin/support?error=message`);
  }

  const thread = await prisma.chatThread.findUnique({ where: { id: threadId }, select: { id: true } });
  if (!thread) redirect(`/${locale}/admin/support?error=failed`);

  await prisma.chatMessage.create({
    data: { threadId: thread.id, authorId: session.id, admin: true, body: message },
  });
  redirect(`/${locale}/admin/support`);
}
