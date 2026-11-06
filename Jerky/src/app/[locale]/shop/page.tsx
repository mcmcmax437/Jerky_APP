import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
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
      <section className="bg-ink-950 text-text-light">
        <div className="grid lg:grid-cols-[minmax(300px,0.9fr)_1.1fr]">
          <div className="flex items-center px-5 py-14 md:px-10 lg:px-16">
            <div className="rise max-w-xl">
              <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
                {dict.shop.eyebrow}
                <span className="h-px w-12 bg-copper" aria-hidden="true" />
              </p>
              <h1 className="mt-5 font-display text-6xl leading-[0.92] font-medium md:text-7xl">{dict.shop.title}</h1>
              {dict.shop.lede ? <p className="mt-5 max-w-md text-base leading-relaxed text-text-light/75">{dict.shop.lede}</p> : null}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/hero-jerky.jpg"
            alt=""
            className="h-64 w-full object-cover object-right sm:h-80 lg:h-[520px]"
          />
        </div>
      </section>
      <ShopCatalog locale={locale} dict={dict} products={products} />
    </>
  );
}
