import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Price } from "@/components/product/Price";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/cart/AddToCart";
import { getProductBySlug, listProducts } from "@/features/catalog/queries";
import { formatWeight } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const { locale, dict } = await readLocale(Promise.resolve({ locale: localeParam }));
  const product = await getProductBySlug(locale, slug);
  if (!product) return { title: dict.shop.title };
  return { title: product.name, description: product.profile };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const { locale, dict } = await readLocale(Promise.resolve({ locale: localeParam }));
  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();

  const others = (await listProducts(locale)).filter((item) => item.slug !== product.slug);

  return (
    <>
      <section className="bg-ink-950 text-text-light">
        <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-16">
          <ProductGallery images={product.images} name={product.name} caption={dict.product.placeholder} />
          <div className="flex flex-col justify-end pb-2">
            <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">{dict.product.draft}</p>
            <h1 className="mt-4 font-display text-[64px] leading-[0.95] font-medium md:text-[76px]">{product.name}</h1>
            <p className="mt-6 text-sm uppercase tracking-[0.16em] text-text-light/70">
              {dict.product.weight}: {formatWeight(product.netWeightG, locale)}
            </p>
            <Price
              amountMinor={product.priceMinor}
              locale={locale}
              comingSoon={dict.price.comingSoon}
              className="mt-4"
            />
          </div>
        </Container>
      </section>

      <section className="bg-ivory-100 text-text-dark">
        <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-10">
            <p className="max-w-2xl text-lg leading-relaxed">{product.profile}</p>
            <div>
              <h2 className="font-display text-[42px] leading-[1.05] font-medium md:text-[48px]">{dict.product.ingredientsTitle}</h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-text-dark/80">{dict.product.ingredientsBody}</p>
            </div>
            <div>
              <h2 className="font-display text-[42px] leading-[1.05] font-medium md:text-[48px]">{dict.product.storageTitle}</h2>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-text-dark/80">{dict.product.storageBody}</p>
            </div>
            <div>
              <h2 className="font-display text-[42px] leading-[1.05] font-medium md:text-[48px]">{dict.product.reviewsTitle}</h2>
              {product.approvedReviewCount === 0 ? (
                <p className="mt-3 text-text-dark/80">{dict.product.reviewsEmpty}</p>
              ) : (
                <p className="mt-3 tabular-nums">
                  {product.averageRating?.toFixed(1)} / 5 · {product.approvedReviewCount}
                </p>
              )}
            </div>
          </div>
          <aside className="h-fit border border-ink-800/10 bg-ivory-200 p-5">
            <AddToCart
              slug={product.slug}
              label={dict.product.add}
              addedLabel={dict.product.added}
              note={dict.product.addNote}
            />
            <Link href={`/${locale}/shop`} className="mt-6 inline-block text-[13px] font-semibold uppercase tracking-[1.5px]">
              {dict.product.back}
            </Link>
          </aside>
        </Container>
      </section>

      {others.length > 0 ? (
        <section className="bg-ivory-200">
          <Container className="py-16">
            <h2 className="font-display text-[42px] leading-[1.05] font-medium md:text-[48px]">{dict.product.related}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {others.map((item) => (
                <ProductCard key={item.slug} product={item} locale={locale} dict={dict} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
