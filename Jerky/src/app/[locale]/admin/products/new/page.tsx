import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/features/admin/actions";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.newTitle };
}

export default async function NewProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const query = await searchParams;

  return (
    <AdminPage title={dict.admin.newTitle} lede={dict.admin.priceHint} back={{ href: `/${locale}/admin/products`, label: dict.admin.formBack }}>
      <ProductForm locale={locale} dict={dict} action={createProduct} error={query.error} />
    </AdminPage>
  );
}
