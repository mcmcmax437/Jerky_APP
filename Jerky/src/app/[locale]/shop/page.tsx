import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductCard } from "@/components/product/ProductCard";
import { listProducts } from "@/features/catalog/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.shop.title, description: dict.shop.title };
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
      <PageIntro eyebrow={dict.shop.eyebrow} title={dict.shop.title} />
      <section className="bg-ivory-100">
        <Container className="py-16 md:py-20">
          <div className="rise grid gap-5 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} locale={locale} dict={dict} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
