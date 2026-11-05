import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/features/admin/actions";
import { getAdminProduct } from "@/features/admin/queries";
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

  return (
    <>
      <PageIntro eyebrow={dict.admin.overviewEyebrow} title={dict.admin.edit} lede={product.slug} />
      <PageBody>
        <ProductForm
          locale={locale}
          dict={dict}
          action={updateProduct}
          product={product}
          error={query.saved ? "saved" : query.error}
        />
      </PageBody>
    </>
  );
}
