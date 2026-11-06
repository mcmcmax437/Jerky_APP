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

function versionData(data: RecipeDraft) {
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
        name: item.name,
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
  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      status: data.status,
      productId: data.productId,
      versions: { create: { versionNumber: 1, ...versionData(data) } },
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
  await prisma.recipe.update({
    where: { id },
    data: { title: data.title, status: data.status, productId: data.productId },
  });
  const latest = recipe.versions[0];
  if (!latest || data.mode === "version") {
    await prisma.recipeVersion.create({
      data: { recipeId: id, versionNumber: (latest?.versionNumber ?? 0) + 1, ...versionData(data) },
    });
  } else {
    await prisma.recipeIngredient.deleteMany({ where: { recipeVersionId: latest.id } });
    await prisma.recipeStep.deleteMany({ where: { recipeVersionId: latest.id } });
    await prisma.recipeVersion.update({ where: { id: latest.id }, data: versionData(data) });
  }
  redirect(`/${locale}/admin/recipes/${id}?saved=1`);
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
