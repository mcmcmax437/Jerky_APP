import { prisma } from "@/lib/db/prisma";

export async function getTestOrder(id: string) {
  return prisma.order.findFirst({
    where: { id, isTest: true },
    include: { items: true },
  });
}
