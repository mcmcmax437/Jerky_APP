import type { Metadata } from "next";
import { CatalogHero } from "@/components/shop/CatalogHero";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { ChatFab } from "@/components/site/ChatFab";
import { listProducts } from "@/features/catalog/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.shop.title, description: dict.shop.lede || dict.shop.title };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const products = await listProducts(locale);

  return (
    <>
      <CatalogHero eyebrow={dict.shop.eyebrow} title={dict.shop.title} lede={dict.shop.lede} />
      <ShopCatalog locale={locale} dict={dict} products={products} criteria />
      <ChatFab href={`/${locale}/chat`} label={dict.chat.open} />
    </>
  );
}
