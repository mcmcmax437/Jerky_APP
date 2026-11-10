import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductBuy } from "@/components/product/ProductBuy";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ShopCard } from "@/components/shop/ShopCard";
import { ChatFab } from "@/components/site/ChatFab";
import { getProductBySlug, listProducts } from "@/features/catalog/queries";
import { catalogPackshot } from "@/features/catalog/packshots";
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
  const photos = product.images.filter((item) => !item.placeholder);
  const gallery = photos.length > 0 ? photos : product.images;
  const image = gallery[0]?.src ?? catalogPackshot(product.slug);
  const frames = gallery.length > 0 ? gallery : [{ src: image, kind: "packshot" }];

  return (
    <>
      <section className="bg-ink-950 text-text-light">
        <div className="mx-auto grid max-w-[83rem] items-center gap-8 px-5 py-10 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:py-14">
          <ProductGallery images={frames} name={product.name} caption={dict.product.placeholder} zoomLabel={dict.product.zoom} />
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[1.5px] text-copper">{dict.product.kind}</p>
            <h1 className="mt-3 font-display text-[64px] leading-[0.95] font-medium md:text-[76px]">{product.name}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-light/75">{product.card || product.profile}</p>
            {product.approvedReviewCount > 0 ? (
              <p className="mt-4 text-sm tabular-nums text-text-light/80">
                {product.averageRating?.toFixed(1)} / 5 · {product.approvedReviewCount}
              </p>
            ) : null}
            <ProductBuy
              locale={locale}
              dict={dict}
              slug={product.slug}
              name={product.name}
              image={image}
              priceMinor={product.priceMinor}
            />
          </div>
        </div>
      </section>

      <section className="bg-ivory-100 text-text-dark">
        <Container className="py-12 md:py-16">
          <ProductTabs
            dict={dict}
            profile={product.profile}
            image={image}
            name={product.name}
            reviewCount={product.approvedReviewCount}
            averageRating={product.averageRating}
          />
        </Container>
      </section>

      {others.length > 0 ? (
        <section className="bg-[#f3efe8] text-text-dark">
          <div className="mx-auto max-w-[83rem] px-5 py-16 md:px-8">
            <h2 className="font-display text-[42px] leading-[1.05] font-medium text-text-dark md:text-[48px]">{dict.product.related}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((item) => (
                <ShopCard key={item.slug} product={item} locale={locale} dict={dict} view="grid" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ChatFab href={`/${locale}/chat`} label={dict.chat.open} />
    </>
  );
}
