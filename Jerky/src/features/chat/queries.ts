import { prisma } from "@/lib/db/prisma";

const messageSelect = {
  id: true,
  body: true,
  admin: true,
  createdAt: true,
  author: { select: { name: true } },
};

export async function listChatThreads() {
  return prisma.chatThread.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      createdAt: true,
      user: { select: { name: true } },
      messages: { orderBy: { createdAt: "asc" }, select: messageSelect },
    },
  });
}

export async function getChatMessages(id: string) {
  const thread = await prisma.chatThread.findUnique({
    where: { id },
    select: { messages: { orderBy: { createdAt: "asc" }, select: messageSelect } },
  });
  return thread?.messages ?? [];
}
