"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { getSession } from "@/features/auth/session";
import { parseRecipeForm, type RecipeDraft } from "./recipe";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin");
  return session;
}

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "pl");
  return isLocale(value) ? value : "pl";
}

async function ingredientNames(ids: string[]) {
  const rows = await prisma.ingredient.findMany({
    where: { id: { in: [...new Set(ids)] } },
    select: { id: true, name: true },
  });
  return new Map(rows.map((row) => [row.id, row.name]));
}

function versionData(data: RecipeDraft, names: Map<string, string>) {
  return {
    meatType: data.meatType,
    rawMeatWeightG: null,
    cutName: null,
    marinadeHours: data.marinadeHours,
    marinadeNotes: null,
    sliceMethod: null,
    sliceThicknessMm: null,
    equipment: null,
    processPlan: data.processPlan,
    ownerNotes: null,
    ingredients: {
      create: data.components.map((item, index) => ({
        ingredientId: item.ingredientId,
        name: names.get(item.ingredientId) ?? "",
        quantity: item.quantity,
        unit: item.unit,
        plannedUnitPrice: item.unitPrice,
        sortOrder: index,
      })),
    },
  };
}

export async function createRecipe(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const parsed = parseRecipeForm(formData);
  if (!parsed.ok) redirect(`/${locale}/admin/recipes/new?error=recipe`);
  const data = parsed.data;
  if (data.productId) {
    const product = await prisma.product.findUnique({ where: { id: data.productId }, select: { id: true } });
    if (!product) redirect(`/${locale}/admin/recipes/new?error=recipe`);
  }
  const names = await ingredientNames(data.components.map((item) => item.ingredientId));
  if (names.size !== new Set(data.components.map((item) => item.ingredientId)).size) redirect(`/${locale}/admin/recipes/new?error=recipe`);
  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      status: data.status,
      productId: data.productId,
      versions: { create: { versionNumber: 1, ...versionData(data, names) } },
    },
  });
  redirect(`/${locale}/admin/recipes/${recipe.id}?saved=1`);
}

export async function updateRecipe(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  const parsed = parseRecipeForm(formData);
  if (!parsed.ok) redirect(`/${locale}/admin/recipes/${id}?error=recipe`);
  const data = parsed.data;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (!recipe) redirect(`/${locale}/admin/recipes`);
  if (data.productId) {
    const product = await prisma.product.findUnique({ where: { id: data.productId }, select: { id: true } });
    if (!product) redirect(`/${locale}/admin/recipes/${id}?error=recipe`);
  }
  const names = await ingredientNames(data.components.map((item) => item.ingredientId));
  if (names.size !== new Set(data.components.map((item) => item.ingredientId)).size) redirect(`/${locale}/admin/recipes/${id}?error=recipe`);
  await prisma.recipe.update({
    where: { id },
    data: { title: data.title, status: data.status, productId: data.productId },
  });
  const latest = recipe.versions[0];
  if (!latest || data.mode === "version") {
    await prisma.recipeVersion.create({
      data: { recipeId: id, versionNumber: (latest?.versionNumber ?? 0) + 1, ...versionData(data, names) },
    });
  } else {
    await prisma.recipeIngredient.deleteMany({ where: { recipeVersionId: latest.id } });
    await prisma.recipeStep.deleteMany({ where: { recipeVersionId: latest.id } });
    await prisma.recipeVersion.update({ where: { id: latest.id }, data: versionData(data, names) });
  }
  redirect(`/${locale}/admin/recipes/${id}?saved=1`);
}

export async function shoppingList(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const ids = formData
    .getAll("ids")
    .map((value) => String(value))
    .filter((value) => /^[a-z0-9]{20,32}$/.test(value))
    .slice(0, 50);
  if (ids.length === 0) redirect(`/${locale}/admin/recipes`);
  redirect(`/${locale}/admin/recipes?shopping=1&ids=${ids.join(",")}`);
}

function decimalOf(value: string) {
  const text = value.trim().replace(",", ".");
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export async function rateRecipe(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  if (!/^[a-z0-9]{20,32}$/.test(id)) redirect(`/${locale}/admin/recipes?rated=bad`);
  const rawRating = String(formData.get("rating") ?? "");
  const rawMeat = String(formData.get("meatKg") ?? "");
  const rating = rawRating ? decimalOf(rawRating) : null;
  const meatKg = rawMeat ? decimalOf(rawMeat) : null;
  if (rawRating && (rating == null || rating < 0 || rating > 10 || rating * 2 !== Math.round(rating * 2))) {
    redirect(`/${locale}/admin/recipes?rated=bad`);
  }
  if (rawMeat && (meatKg == null || meatKg <= 0 || meatKg > 999)) redirect(`/${locale}/admin/recipes?rated=bad`);
  if (rating == null && meatKg == null) redirect(`/${locale}/admin/recipes?rated=bad`);
  if (rating != null) await prisma.recipe.update({ where: { id }, data: { rating: rating.toFixed(1) } });
  if (meatKg != null) {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { versions: { orderBy: { versionNumber: "desc" }, take: 1, select: { id: true } } },
    });
    const latest = recipe?.versions[0];
    if (latest) {
      await prisma.recipeVersion.update({
        where: { id: latest.id },
        data: { rawMeatWeightG: Math.round(meatKg * 1000) },
      });
    }
  }
  redirect(`/${locale}/admin/recipes?rated=1`);
}

export async function deleteRecipe(formData: FormData) {
  await requireAdmin();
  const locale = localeFrom(formData);
  const id = String(formData.get("id") ?? "");
  try {
    await prisma.recipe.delete({ where: { id } });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/${locale}/admin/recipes/${id}?error=used`);
  }
  redirect(`/${locale}/admin/recipes`);
}
