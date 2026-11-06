import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { ProductBoard } from "@/components/admin/ProductBoard";
import { listAdminProducts } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.products };
}

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const products = await listAdminProducts();

  return (
    <AdminPage
      title={dict.admin.products}
      lede={dict.admin.priceHint}
      action={
        <Link href={`/${locale}/admin/products/new`} className="press rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1612]">
          {dict.admin.create}
        </Link>
      }
    >
      <ProductBoard
        locale={locale}
        dict={dict}
        products={products.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.translations.find((item) => item.locale === locale)?.name ?? product.slug,
          photo: product.media[0]?.publicPath ?? null,
          priceMinor: product.priceMinor,
          published: product.published,
        }))}
      />
    </AdminPage>
  );
}
