"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/features/auth/session";
import type { IngredientItem } from "./recipe";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/pl/login?next=/pl/admin");
  return session;
}

async function ingredients() {
  return prisma.ingredient.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: { id: true, name: true },
  });
}

export async function mutateIngredient(formData: FormData): Promise<{
  items: IngredientItem[];
  addedId: string | null;
  error: "fields" | null;
}> {
  await requireAdmin();
  const intent = String(formData.get("intent") ?? "");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  let addedId: string | null = null;
  let error: "fields" | null = null;

  if (intent === "add") {
    if (!name || name.length > 160) {
      error = "fields";
    } else {
      const existing = await prisma.ingredient.findMany({ where: { name }, take: 1, select: { id: true } });
      addedId =
        existing[0]?.id ??
        (await prisma.ingredient.create({ data: { name }, select: { id: true } })).id;
    }
  } else if (intent === "rename") {
    if (!id || !name || name.length > 160) {
      error = "fields";
    } else {
      const clash = await prisma.ingredient.findMany({
        where: { name, NOT: { id } },
        take: 1,
        select: { id: true },
      });
      if (clash.length > 0) {
        error = "fields";
      } else {
        await prisma.ingredient.update({ where: { id }, data: { name } });
        await prisma.recipeIngredient.updateMany({ where: { ingredientId: id }, data: { name } });
      }
    }
  } else if (intent === "delete") {
    if (!id) {
      error = "fields";
    } else {
      await prisma.ingredient.delete({ where: { id } });
    }
  } else {
    error = "fields";
  }

  return { items: await ingredients(), addedId, error };
}
