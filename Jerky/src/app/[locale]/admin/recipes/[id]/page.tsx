import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/AdminPage";
import { DeleteRecipeButton } from "@/components/admin/DeleteRecipeButton";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { deleteRecipe, updateRecipe } from "@/features/admin/recipe-actions";
import { meatTypes, type MeatTypeName } from "@/features/admin/recipe";
import { getAdminRecipe, listAdminProducts } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { dict } = await readLocale(Promise.resolve({ locale }));
  return { title: dict.admin.terminal.recipe.editTitle };
}

function decimal(value: { toString(): string } | null | undefined) {
  return value == null ? "" : value.toString();
}

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const { locale, dict } = await readLocale(Promise.resolve({ locale: localeParam }));
  const query = await searchParams;
  const [recipe, products] = await Promise.all([getAdminRecipe(id), listAdminProducts()]);
  if (!recipe) notFound();
  const version = recipe.versions[0];
  const copy = dict.admin.terminal.recipe;

  return (
    <AdminPage
      title={recipe.title}
      lede={copy.private}
      back={{ href: `/${locale}/admin/recipes`, label: dict.admin.formBack }}
      action={
        <DeleteRecipeButton action={deleteRecipe} id={recipe.id} locale={locale} label={copy.remove} confirmLabel={copy.removeConfirm} />
      }
    >
      <RecipeForm
        locale={locale}
        dict={dict}
        action={updateRecipe}
        error={query.error}
        saved={query.saved === "1"}
        products={products.map((product) => ({
          id: product.id,
          name: product.translations.find((item) => item.locale === locale)?.name ?? product.slug,
        }))}
        recipe={{
          id: recipe.id,
          title: recipe.title,
          status: recipe.status,
          productId: recipe.productId,
          versionNumber: version?.versionNumber ?? 1,
          meatType: meatTypes.includes(version?.meatType as MeatTypeName) ? (version?.meatType as MeatTypeName) : "",
          marinadeHours: decimal(version?.marinadeHours),
          processPlan: version?.processPlan ?? "",
          components:
            version?.ingredients.map((item) => ({
              name: item.name,
              quantity: decimal(item.quantity),
              unit: item.unit,
              unitPrice: decimal(item.plannedUnitPrice),
            })) ?? [],
        }}
      />
    </AdminPage>
  );
}
