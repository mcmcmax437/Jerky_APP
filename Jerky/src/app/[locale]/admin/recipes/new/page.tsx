import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { createRecipe } from "@/features/admin/recipe-actions";
import { listAdminProducts } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.recipe.newTitle };
}

export default async function NewRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;
  const products = await listAdminProducts();

  return (
    <AdminPage title={dict.admin.terminal.recipe.newTitle} lede={dict.admin.terminal.recipe.private}>
      <RecipeForm
        locale={locale}
        dict={dict}
        action={createRecipe}
        error={query.error}
        products={products.map((product) => ({
          id: product.id,
          name: product.translations.find((item) => item.locale === locale)?.name ?? product.slug,
        }))}
      />
    </AdminPage>
  );
}
