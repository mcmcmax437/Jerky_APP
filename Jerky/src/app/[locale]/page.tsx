import type { Metadata } from "next";
import { HomeCatalog } from "@/components/home/HomeCatalog";
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
      <section className="bg-ink-950 text-text-light">
        <div className="grid lg:min-h-[560px] lg:grid-cols-[minmax(320px,0.9fr)_1.2fr]">
          <div className="flex items-center px-5 py-16 md:px-10 lg:px-16 lg:py-20">
            <div className="max-w-xl">
              <p className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-copper">
                {dict.home.eyebrow}
                <span className="h-px w-12 bg-copper" aria-hidden="true" />
              </p>
              <h1 className="mt-6 font-display text-6xl leading-[0.95] font-medium md:text-7xl lg:text-[5.4rem]">
                {dict.home.title}
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-text-light/75">{dict.home.lede}</p>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/hero-jerky.jpg"
            alt=""
            className="h-72 w-full object-cover object-[70%_center] sm:h-96 lg:h-full lg:min-h-[560px]"
          />
        </div>
      </section>
      <HomeCatalog
        locale={locale}
        dict={dict}
        products={products.map((product) => ({
          slug: product.slug,
          name: product.name,
          netWeightG: product.netWeightG,
          priceMinor: product.priceMinor,
          accent: product.accent,
        }))}
      />
    </>
  );
}
