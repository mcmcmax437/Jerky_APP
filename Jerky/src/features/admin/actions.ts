"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { parsePriceMinor } from "./price";
import { photoIsInvalid, removeUploadedPhoto, saveProductPhoto } from "./product-photo";
import { isOrderStatus, type OrderStatusName } from "./order-status";
import { formatDateTime } from "@/lib/format";
import { getAdminOrder, orderLines, type OrderLine } from "./queries";
import { slotAssignments } from "./slots";

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

export async function reorderProducts(ids: string[]) {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length > 999 || ids.some((id) => typeof id !== "string" || id.length < 1 || id.length > 80)) return;
  if (new Set(ids).size !== ids.length) return;
  const products = await prisma.product.findMany({
    select: { id: true, published: true },
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });
  const published = products.filter((item) => item.published).map((item) => item.id);
  if (ids.length !== published.length || ids.some((id) => !published.includes(id))) return;
  const rest = products.filter((item) => !item.published).map((item) => item.id);
  const assignments = slotAssignments(ids, rest);
  await prisma.$transaction(
    assignments.map((item) => prisma.product.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })),
  );
  revalidatePath("/", "layout");
}

export async function moveOrder(id: string, status: string) {
  await requireAdmin();
  if (!isOrderStatus(status) || id.length < 1 || id.length > 80) return false;
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) return false;
  if (order.status !== status) {
    await prisma.order.update({
      where: { id },
      data: {
        status,
        events: { create: { fromStatus: order.status, toStatus: status } },
      },
    });
  }
  revalidatePath("/", "layout");
  return true;
}

export type OrderPopupData = {
  id: string;
  number: string;
  status: OrderStatusName;
  customerName: string;
  email: string;
  phone: string | null;
  address: string;
  lines: OrderLine[];
  notes: { id: string; body: string; at: string }[];
  events: { id: string; fromStatus: OrderStatusName | null; toStatus: OrderStatusName; at: string }[];
};

export async function readOrderPopup(id: string, locale: string): Promise<OrderPopupData | null> {
  await requireAdmin();
  if (id.length < 1 || id.length > 80) return null;
  const language = isLocale(locale) ? locale : "pl";
  const order = await getAdminOrder(id);
  if (!order || !isOrderStatus(order.status)) return null;
  const lines = await orderLines(order.items);
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: [order.addressLine, order.postalCode, order.city, order.country].filter(Boolean).join(", "),
    lines,
    notes: order.notes.map((note) => ({ id: note.id, body: note.body, at: formatDateTime(note.createdAt, language) })),
    events: order.events.flatMap((event) => {
      if (!isOrderStatus(event.toStatus) || (event.fromStatus && !isOrderStatus(event.fromStatus))) return [];
      return [{
        id: event.id,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        at: formatDateTime(event.createdAt, language),
      }];
    }),
  };
}

export async function saveOrderNote(id: string, body: string) {
  await requireAdmin();
  const text = body.trim();
  if (id.length < 1 || id.length > 80 || text.length < 1 || text.length > 4000) return false;
  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) return false;
  await prisma.orderNote.create({ data: { orderId: id, body: text } });
  revalidatePath("/", "layout");
  return true;
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isOrderStatus(status)) redirect(`/${locale}/admin/orders`);
  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!order) redirect(`/${locale}/admin/orders`);
  if (order.status !== status) {
    await prisma.order.update({
      where: { id },
      data: {
        status,
        events: { create: { fromStatus: order.status, toStatus: status } },
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
  card: z.string().trim().max(400),
  profile: z.string().trim().min(1).max(2000),
});

const productSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  accent: z.enum(accents),
  sortOrder: z.number().int().min(0).max(999),
  netWeightG: z.number().int().min(1).max(5000),
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
    netWeightG: Number(formData.get("netWeightG") ?? 100),
    published: formData.get("published") === "on",
    price: String(formData.get("price") ?? ""),
    pl: { name: String(formData.get("name-pl") ?? ""), card: String(formData.get("card-pl") ?? ""), profile: String(formData.get("profile-pl") ?? "") },
    uk: { name: String(formData.get("name-uk") ?? ""), card: String(formData.get("card-uk") ?? ""), profile: String(formData.get("profile-uk") ?? "") },
    en: { name: String(formData.get("name-en") ?? ""), card: String(formData.get("card-en") ?? ""), profile: String(formData.get("profile-en") ?? "") },
  });
}

function translationData(copy: { name: string; card: string; profile: string }) {
  return { name: copy.name, card: copy.card || null, profile: copy.profile };
}

async function storePackshot(productId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File)) return null;
  const saved = await saveProductPhoto(file);
  if (saved === "invalid") return "invalid" as const;
  if (!saved) return null;
  const current = await prisma.productMedia.findFirst({
    where: { productId, kind: "packshot" },
    orderBy: { sortOrder: "asc" },
  });
  if (current) {
    await prisma.productMedia.update({
      where: { id: current.id },
      data: { publicPath: saved, isPlaceholder: false },
    });
    await removeUploadedPhoto(current.publicPath);
  } else {
    await prisma.productMedia.create({
      data: { productId, kind: "packshot", sortOrder: 0, publicPath: saved, isPlaceholder: false },
    });
  }
  return saved;
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const parsed = productInput(formData);
  if (!parsed.success) redirect(`/${locale}/admin/products/new?error=fields`);
  const price = parsePriceMinor(parsed.data.price);
  if (price === "invalid") redirect(`/${locale}/admin/products/new?error=price`);
  if (photoIsInvalid(formData.get("photo"))) redirect(`/${locale}/admin/products/new?error=photo`);
  try {
    const product = await prisma.product.create({
      data: {
        slug: parsed.data.slug,
        accent: parsed.data.accent,
        sortOrder: parsed.data.sortOrder,
        published: parsed.data.published,
        priceMinor: price,
        netWeightG: parsed.data.netWeightG,
        currency: "PLN",
        translations: {
          create: locales.map((item) => ({ locale: item, ...translationData(parsed.data[item]) })),
        },
      },
    });
    if ((await storePackshot(product.id, formData.get("photo"))) === "invalid") {
      redirect(`/${locale}/admin/products/${product.id}?error=photo`);
    }
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
  if (photoIsInvalid(formData.get("photo"))) redirect(`/${locale}/admin/products/${id}?error=photo`);
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) redirect(`/${locale}/admin/products`);
  if ((await storePackshot(id, formData.get("photo"))) === "invalid") redirect(`/${locale}/admin/products/${id}?error=photo`);
  await prisma.product.update({
    where: { id },
    data: {
      accent: parsed.data.accent,
      sortOrder: parsed.data.sortOrder,
      netWeightG: parsed.data.netWeightG,
      published: parsed.data.published,
      priceMinor: price,
    },
  });
  for (const item of locales) {
    const copy = translationData(parsed.data[item]);
    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: id, locale: item } },
      update: copy,
      create: { productId: id, locale: item, ...copy },
    });
  }
  redirect(`/${locale}/admin/products/${id}?saved=1`);
}
