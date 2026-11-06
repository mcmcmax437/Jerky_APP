import type { Metadata } from "next";
import { CatalogHero } from "@/components/shop/CatalogHero";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { listProducts } from "@/features/catalog/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return {
    title: { absolute: dict.meta.siteName },
    description: dict.home.lede,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const products = await listProducts(locale);

  return (
    <>
      <CatalogHero eyebrow={dict.home.eyebrow} title={dict.home.title} lede={dict.home.lede} />
      <ShopCatalog locale={locale} dict={dict} products={products} />
    </>
  );
}
