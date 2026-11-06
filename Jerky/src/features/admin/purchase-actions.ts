"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { matchPurchaseQr, parsePurchaseQr } from "./purchase-qr";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin/purchases");
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
  const recipeId = String(formData.get("recipeId") ?? "");
  const componentName = String(formData.get("componentName") ?? "").trim();
  const purchasedOn = parseDate(String(formData.get("purchasedOn") ?? ""));
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (name.length < 1 || name.length > 160 || !recipeId || !componentName || !purchasedOn) {
    redirect(`/${locale}/admin/purchases?error=fields`);
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: { ingredients: true },
      },
    },
  });
  const known = recipe?.versions[0]?.ingredients.some((item) => item.name.trim().toLowerCase() === componentName.toLowerCase());
  if (!known) redirect(`/${locale}/admin/purchases?error=fields`);

  await prisma.purchasedProduct.create({
    data: { name, recipeId, componentName, purchasedOn, note: note || null },
  });
  redirect(`/${locale}/admin/purchases`);
}

export async function addPurchaseFromQr(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const parsed = parsePurchaseQr(String(formData.get("code") ?? ""));
  if (!parsed) redirect(`/${locale}/admin/purchases?error=qr`);

  const recipes = await prisma.recipe.findMany({
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1, include: { ingredients: true } },
    },
  });
  const lines = recipes.flatMap((recipe) =>
    (recipe.versions[0]?.ingredients ?? []).map((item) => ({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      componentName: item.name,
    })),
  );
  const matches = matchPurchaseQr(lines, parsed);
  if (matches.length === 0) redirect(`/${locale}/admin/purchases?error=unknown`);
  if (matches.length > 1) redirect(`/${locale}/admin/purchases?error=many`);

  const match = matches[0];
  await prisma.purchasedProduct.create({
    data: {
      name: parsed.name,
      recipeId: match.recipeId,
      componentName: match.componentName,
      purchasedOn: new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`),
    },
  });
  redirect(`/${locale}/admin/purchases?saved=1`);
}

export async function deletePurchase(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.purchasedProduct.deleteMany({ where: { id } });
  redirect(`/${locale}/admin/purchases`);
}
