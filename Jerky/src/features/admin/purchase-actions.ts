"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { parsePurchaseQr } from "./purchase-qr";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin/costs");
  return session;
}

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "pl");
  return isLocale(value) ? value : "pl";
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createPurchase(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const name = String(formData.get("name") ?? "").trim();
  const ingredientId = String(formData.get("ingredientId") ?? "").trim();
  const purchasedOn = parseDate(String(formData.get("purchasedOn") ?? ""));
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const priceText = String(formData.get("unitPrice") ?? "").trim().replace(",", ".");
  const unitPrice = /^\d+(\.\d+)?$/.test(priceText) ? Number(priceText) : Number.NaN;
  const quantityText = String(formData.get("quantity") ?? "").trim().replace(",", ".");
  const quantity = /^\d+(\.\d+)?$/.test(quantityText) ? Number(quantityText) : Number.NaN;
  const unit = String(formData.get("unit") ?? "");
  const units = ["G", "KG", "ML", "L", "PCS"] as const;
  const measure = units.find((item) => item === unit);
  if (
    name.length < 1 ||
    name.length > 160 ||
    !ingredientId ||
    !purchasedOn ||
    !Number.isFinite(unitPrice) ||
    unitPrice < 0 ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > 1_000_000 ||
    !measure
  ) {
    redirect(`/${locale}/admin/costs?error=fields`);
  }

  const ingredient = await prisma.ingredient.findMany({ where: { id: ingredientId }, take: 1, select: { id: true } });
  if (ingredient.length === 0) redirect(`/${locale}/admin/costs?error=fields`);

  const price = Math.round(unitPrice * 10000) / 10000;
  const bought = Math.round(quantity * 1000) / 1000;
  await prisma.purchasedProduct.create({
    data: {
      name,
      ingredientId,
      unitPrice: price,
      quantity: bought,
      unit: measure,
      purchasedOn,
      note: note || null,
    },
  });
  redirect(`/${locale}/admin/costs?saved=1`);
}

export async function addPurchaseFromQr(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const parsed = parsePurchaseQr(String(formData.get("code") ?? ""));
  if (!parsed) redirect(`/${locale}/admin/costs?error=qr`);

  const ingredient = await prisma.ingredient.findMany({
    where: { name: parsed.component },
    take: 1,
    select: { id: true },
  });
  await prisma.purchasedProduct.create({
    data: {
      name: parsed.name,
      ingredientId: ingredient[0]?.id ?? null,
      componentName: ingredient.length === 0 ? parsed.component : null,
      purchasedOn: new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`),
    },
  });
  redirect(`/${locale}/admin/costs?saved=1`);
}

export async function deletePurchase(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.purchasedProduct.deleteMany({ where: { id } });
  redirect(`/${locale}/admin/costs`);
}
