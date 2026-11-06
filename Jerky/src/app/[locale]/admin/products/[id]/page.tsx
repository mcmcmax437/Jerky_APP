import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/AdminPage";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/features/admin/actions";
import { getAdminProduct } from "@/features/admin/queries";
import { catalogPackshot } from "@/features/catalog/packshots";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { dict } = await readLocale(Promise.resolve({ locale }));
  return { title: dict.admin.edit };
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const { locale, dict } = await readLocale(Promise.resolve({ locale: localeParam }));
  const product = await getAdminProduct(id);
  if (!product) notFound();
  const query = await searchParams;
  const name = product.translations.find((item) => item.locale === locale)?.name ?? product.slug;

  return (
    <AdminPage title={name} lede={dict.admin.priceHint}>
      <ProductForm
        locale={locale}
        dict={dict}
        action={updateProduct}
        product={{
          ...product,
          photo: product.media.find((item) => item.kind === "packshot")?.publicPath ?? product.media[0]?.publicPath ?? catalogPackshot(product.slug),
        }}
        error={query.saved ? "saved" : query.error}
      />
    </AdminPage>
  );
}
