"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { buckets, clientAddress, isLocked, isSpamTrap, take } from "@/lib/security/limit";

/** Thread ids are cuids: lowercase letters and digits. */
function threadIsValid(value: string) {
  return /^[0-9a-z]{20,40}$/.test(value);
}

async function floodGate(locale: Locale) {
  const ip = await clientAddress();
  if (await isLocked("chat-ip", ip)) redirect(`/${locale}/chat?error=locked`);
  if (!await take("chat-ip", ip, buckets.chatIp)) redirect(`/${locale}/chat?error=locked`);
}

export async function sendChatMessage(formData: FormData) {
  const requested = String(formData.get("locale") ?? "pl");
  const locale: Locale = isLocale(requested) ? requested : "pl";
  const threadId = String(formData.get("t") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < 2 || message.length > 1000) redirect(`/${locale}/chat?error=message`);
  if (threadId && !threadIsValid(threadId)) redirect(`/${locale}/chat?error=failed`);

  await floodGate(locale);

  const session = await getSession();
  if (session && !await take("chat-user", session.id, buckets.chatUser)) redirect(`/${locale}/chat?error=locked`);

  // A filled honeypot means a bot. Answer without touching the database.
  if (isSpamTrap(String(formData.get("company") ?? ""))) redirect(`/${locale}/chat`);

  if (!threadId) {
    const started = await prisma.chatThread.create({
      data: {
        userId: session?.id,
        messages: { create: { authorId: session?.id, body: message } },
      },
      select: { id: true },
    });
    redirect(`/${locale}/chat?t=${started.id}`);
  }

  if (!threadIsValid(threadId)) redirect(`/${locale}/chat?error=failed`);
  const thread = await prisma.chatThread.findUnique({ where: { id: threadId }, select: { id: true } });
  if (!thread) redirect(`/${locale}/chat?error=failed`);

  await prisma.chatMessage.create({
    data: { threadId: thread.id, authorId: session?.id, body: message },
  });
  redirect(`/${locale}/chat?t=${thread.id}`);
}
