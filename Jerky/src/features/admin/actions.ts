"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { parsePriceMinor } from "./price";

const statuses = ["NEW", "CONFIRMED", "PREPARING", "READY", "SHIPPED", "COMPLETED", "CANCELLED", "REFUNDED"] as const;
const accents = ["bone", "teriyaki", "chili"] as const;
const locales = ["pl", "uk", "en"] as const;

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin");
  return session;
}

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "pl");
  return isLocale(value) ? value : "pl";
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!statuses.includes(status as (typeof statuses)[number])) redirect(`/${locale}/admin/orders`);
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) redirect(`/${locale}/admin/orders`);
  if (order.status !== status) {
    await prisma.order.update({
      where: { id },
      data: {
        status: status as (typeof statuses)[number],
        events: { create: { fromStatus: order.status, toStatus: status as (typeof statuses)[number] } },
      },
    });
  }
  redirect(`/${locale}/admin/orders/${id}`);
}

export async function addOrderNote(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 1 || body.length > 4000) redirect(`/${locale}/admin/orders/${id}?error=note`);
  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) redirect(`/${locale}/admin/orders`);
  await prisma.orderNote.create({ data: { orderId: id, body } });
  redirect(`/${locale}/admin/orders/${id}`);
}

const translationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  profile: z.string().trim().min(1).max(2000),
});

const productSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  accent: z.enum(accents),
  sortOrder: z.number().int().min(0).max(999),
  published: z.boolean(),
  price: z.string(),
  pl: translationSchema,
  uk: translationSchema,
  en: translationSchema,
});

function productInput(formData: FormData) {
  return productSchema.safeParse({
    slug: String(formData.get("slug") ?? ""),
    accent: String(formData.get("accent") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    published: formData.get("published") === "on",
    price: String(formData.get("price") ?? ""),
    pl: { name: String(formData.get("name-pl") ?? ""), profile: String(formData.get("profile-pl") ?? "") },
    uk: { name: String(formData.get("name-uk") ?? ""), profile: String(formData.get("profile-uk") ?? "") },
    en: { name: String(formData.get("name-en") ?? ""), profile: String(formData.get("profile-en") ?? "") },
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const parsed = productInput(formData);
  if (!parsed.success) redirect(`/${locale}/admin/products/new?error=fields`);
  const price = parsePriceMinor(parsed.data.price);
  if (price === "invalid") redirect(`/${locale}/admin/products/new?error=price`);
  try {
    const product = await prisma.product.create({
      data: {
        slug: parsed.data.slug,
        accent: parsed.data.accent,
        sortOrder: parsed.data.sortOrder,
        published: parsed.data.published,
        priceMinor: price,
        netWeightG: 100,
        currency: "PLN",
        translations: {
          create: locales.map((item) => ({ locale: item, ...parsed.data[item] })),
        },
      },
    });
    redirect(`/${locale}/admin/products/${product.id}`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/${locale}/admin/products/new?error=slug`);
  }
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  const parsed = productInput(formData);
  if (!parsed.success) redirect(`/${locale}/admin/products/${id}?error=fields`);
  const price = parsePriceMinor(parsed.data.price);
  if (price === "invalid") redirect(`/${locale}/admin/products/${id}?error=price`);
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) redirect(`/${locale}/admin/products`);
  await prisma.product.update({
    where: { id },
    data: {
      accent: parsed.data.accent,
      sortOrder: parsed.data.sortOrder,
      published: parsed.data.published,
      priceMinor: price,
    },
  });
  for (const item of locales) {
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: id, locale: item } },
      update: parsed.data[item],
      create: { productId: id, locale: item, ...parsed.data[item] },
    });
  }
  redirect(`/${locale}/admin/products/${id}?saved=1`);
}
