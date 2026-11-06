import Link from "next/link";
import { formatWeight } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";
import { catalogPackshot } from "@/features/catalog/packshots";
import type { CatalogProduct } from "@/features/catalog/types";
import { Badge } from "@/components/ui/Badge";
import { Price } from "./Price";

export function ProductCard({
  product,
  locale,
  dict,
}: {
  product: CatalogProduct;
  locale: Locale;
  dict: Dictionary;
}) {
  const src = product.images[0]?.src ?? catalogPackshot(product.slug);
  const alt = `${dict.product.placeholder} ${product.name}.`;

  return (
    <article className="h-full bg-ink-900 text-text-light">
      <Link
        href={`/${locale}/product/${product.slug}`}
        className="group flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
      >
        <div className="aspect-[3/4] overflow-hidden bg-ink-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-4xl leading-none font-medium">{product.name}</h3>
            <Badge accent={product.accent} />
          </div>
          <p className="text-sm text-text-light/70">{formatWeight(product.netWeightG, locale)}</p>
          <p className="line-clamp-4 text-sm leading-relaxed text-text-light/75">{product.card || product.profile}</p>
          <div className="mt-auto flex items-center justify-between pt-2 text-sm">
            <Price
              amountMinor={product.priceMinor}
              locale={locale}
              comingSoon={dict.price.comingSoon}
              className="text-text-light"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
              {dict.shop.view}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
