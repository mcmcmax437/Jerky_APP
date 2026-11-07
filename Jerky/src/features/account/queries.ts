import { prisma } from "@/lib/db/prisma";

export function listOwnSupportMessages(userId: string) {
  return prisma.supportMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, body: true, createdAt: true },
  });
}
