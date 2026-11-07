import { prisma } from "@/lib/db/prisma";
import { meatTypes, type MeatTypeName } from "./recipe";
import { isOrderStatus, type OrderStatusName } from "./order-status";

export type AdminOrderStatus = OrderStatusName;
export const isAdminOrderStatus = isOrderStatus;

export type OrderLine = {
  id: string;
  name: string;
  grams: number;
  quantity: number;
  meat: MeatTypeName | null;
  marinade: string | null;
};

async function recipeFacts(productIds: Array<string | null>) {
  const ids = [...new Set(productIds.filter((id): id is string => Boolean(id)))];
  const facts = new Map<string, { meat: MeatTypeName | null; marinade: string | null }>();
  if (ids.length === 0) return facts;
  const recipes = await prisma.recipe.findMany({
    where: { productId: { in: ids } },
    orderBy: { updatedAt: "desc" },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: { ingredients: { orderBy: { sortOrder: "asc" }, select: { name: true } } },
      },
    },
  });
  for (const id of ids) {
    const rows = recipes.filter((recipe) => recipe.productId === id);
    const version = (rows.find((recipe) => recipe.status === "APPROVED") ?? rows[0])?.versions[0];
    const names = version?.ingredients.map((item) => item.name.trim()).filter(Boolean) ?? [];
    const meat = version?.meatType && meatTypes.includes(version.meatType) ? version.meatType : null;
    facts.set(id, {
      meat,
      marinade: names.length === 0 ? null : `${names.slice(0, 4).join(", ")}${names.length > 4 ? "…" : ""}`,
    });
  }
  return facts;
}

export async function orderLines(
  items: Array<{ id: string; productId: string | null; name: string; netWeightG: number; quantity: number }>,
): Promise<OrderLine[]> {
  const facts = await recipeFacts(items.map((item) => item.productId));
  return items.map((item) => {
    const fact = item.productId ? facts.get(item.productId) : undefined;
    return {
      id: item.id,
      name: item.name,
      grams: item.netWeightG,
      quantity: item.quantity,
      meat: fact?.meat ?? null,
      marinade: fact?.marinade ?? null,
    };
  });
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
    include: { items: { select: { id: true, productId: true, name: true, netWeightG: true, quantity: true } } },
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
    include: { translations: true, media: { orderBy: { sortOrder: "asc" as const }, take: 1 } },
  });
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { translations: true, media: { orderBy: { sortOrder: "asc" } } },
  });
}

const dayMs = 24 * 60 * 60 * 1000;

function moneySum(values: Array<number | null>) {
  const known = values.filter((value): value is number => value != null);
  if (known.length === 0) return null;
  return known.reduce((sum, value) => sum + value, 0);
}

export function percentChange(current: number, previous: number) {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export async function countNewOrders() {
  return prisma.order.count({ where: { status: "NEW" } });
}

export async function adminPulse(days: number) {
  const now = new Date();
  const since = new Date(now.getTime() - days * dayMs);
  const previousSince = new Date(since.getTime() - days * dayMs);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: previousSince } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      customerName: true,
      status: true,
      totalMinor: true,
      createdAt: true,
      items: { select: { slug: true, name: true, quantity: true } },
    },
  });
  const current = orders.filter((order) => order.createdAt >= since);
  const previous = orders.filter((order) => order.createdAt < since);
  const buckets = Array.from({ length: 5 }, (_, index) => {
    const start = new Date(since.getTime() + (index * days * dayMs) / 5);
    const end = new Date(since.getTime() + ((index + 1) * days * dayMs) / 5);
    const rows = current.filter((order) => order.createdAt >= start && (index === 4 ? order.createdAt <= now : order.createdAt < end));
    return { start, orders: rows.length, revenueMinor: moneySum(rows.map((order) => order.totalMinor)) };
  });
  const flavors = new Map<string, { slug: string; name: string; packs: number }>();
  for (const order of current) {
    for (const item of order.items) {
      const row = flavors.get(item.slug) ?? { slug: item.slug, name: item.name, packs: 0 };
      row.packs += item.quantity;
      flavors.set(item.slug, row);
    }
  }
  const [produced, reviews, recipes, batches] = await Promise.all([
    prisma.batchOutput.aggregate({
      _sum: { finishedWeightG: true },
      where: { testBatch: { madeOn: { gte: since } } },
    }),
    prisma.customerReview.aggregate({
      where: { status: "APPROVED", createdAt: { gte: since } },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.recipe.findMany({
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        product: { select: { slug: true, translations: { select: { locale: true, name: true } } } },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: {
            batches: {
              orderBy: { madeOn: "desc" },
              take: 1,
              include: { evaluation: { select: { overall: true } } },
            },
          },
        },
      },
    }),
    prisma.testBatch.findMany({
      orderBy: { madeOn: "desc" },
      take: 4,
      include: {
        output: { select: { finishedWeightG: true } },
        recipeVersion: {
          include: {
            recipe: {
              include: { product: { select: { translations: { select: { locale: true, name: true } }, slug: true } } },
            },
          },
        },
      },
    }),
  ]);

  return {
    orders: current.length,
    previousOrders: previous.length,
    revenueMinor: moneySum(current.map((order) => order.totalMinor)),
    previousRevenueMinor: moneySum(previous.map((order) => order.totalMinor)),
    producedGrams: produced._sum.finishedWeightG,
    rating: reviews._count > 0 ? reviews._avg.rating : null,
    reviewCount: reviews._count,
    buckets,
    flavors: [...flavors.values()].sort((a, b) => b.packs - a.packs),
    latest: current.slice(0, 5),
    recipes,
    batches,
  };
}

export async function listAdminRecipes() {
  return prisma.recipe.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      product: { select: { translations: { select: { locale: true, name: true } } } },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        select: {
          versionNumber: true,
          ingredients: {
            orderBy: { sortOrder: "asc" },
            select: { name: true, quantity: true, unit: true, plannedUnitPrice: true },
          },
        },
      },
    },
  });
}

export async function getAdminRecipe(id: string) {
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: {
          ingredients: { orderBy: { sortOrder: "asc" } },
          steps: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
}

export async function listPurchaseRecipes() {
  return prisma.recipe.findMany({
    orderBy: { title: "asc" },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: { ingredients: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function listPurchases() {
  return prisma.purchasedProduct.findMany({
    orderBy: [{ purchasedOn: "desc" }, { createdAt: "desc" }],
    include: {
      recipe: {
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            include: { ingredients: true },
          },
        },
      },
    },
  });
}

export async function listAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, banned: true, banReason: true, createdAt: true },
  });
}

export async function listAdminReviews() {
  return prisma.customerReview.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { product: { select: { slug: true, translations: { select: { locale: true, name: true } } } } },
  });
}

export async function listAccountOrders(userId: string, email: string) {
  return prisma.order.findMany({
    where: { OR: [{ userId }, { email }] },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { name: true, quantity: true, slug: true } } },
  });
}
