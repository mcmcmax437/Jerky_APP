import { prisma } from "@/lib/db/prisma";

const statuses = ["NEW", "CONFIRMED", "PREPARING", "READY", "SHIPPED", "COMPLETED", "CANCELLED", "REFUNDED"] as const;
export type AdminOrderStatus = (typeof statuses)[number];

export function isAdminOrderStatus(value: string): value is AdminOrderStatus {
  return statuses.includes(value as AdminOrderStatus);
}

export async function adminCounts() {
  const [orders, products, published] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
  ]);
  return { orders, products, published };
}

export async function latestOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, number: true, customerName: true, status: true, isTest: true, createdAt: true },
  });
}

export async function listAdminOrders(filters: { status?: AdminOrderStatus; query?: string }) {
  const query = filters.query?.trim();
  return prisma.order.findMany({
    where: {
      status: filters.status,
      ...(query
        ? {
            OR: [
              { number: { contains: query } },
              { email: { contains: query } },
              { customerName: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true } },
    },
  });
}

export async function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  });
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { translations: true },
  });
}

export async function listAccountOrders(userId: string, email: string) {
  return prisma.order.findMany({
    where: { OR: [{ userId }, { email }] },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { name: true, quantity: true } } },
  });
}
