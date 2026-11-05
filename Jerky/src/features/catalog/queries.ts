import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n/locales";
import type { CatalogProduct } from "./types";

const accents = new Set(["bone", "teriyaki", "chili"]);

type ProductRecord = {
  slug: string;
  netWeightG: number;
  priceMinor: number | null;
  currency: string;
  accent: string;
  translations: { locale: string; name: string; profile: string }[];
  media: { publicPath: string; kind: string; isPlaceholder: boolean; sortOrder: number }[];
  reviews: { rating: number }[];
};

function pickTranslation(
  translations: ProductRecord["translations"],
  locale: Locale,
) {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === "pl") ??
    translations[0]
  );
}

export function toCatalogProduct(product: ProductRecord, locale: Locale): CatalogProduct | null {
  const translation = pickTranslation(product.translations, locale);
  if (!translation) return null;

  const approved = product.reviews;
  const average =
    approved.length > 0
      ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length
      : null;

  return {
    slug: product.slug,
    name: translation.name,
    profile: translation.profile,
    netWeightG: product.netWeightG,
    priceMinor: product.priceMinor,
    currency: product.currency,
    accent: accents.has(product.accent) ? (product.accent as CatalogProduct["accent"]) : "bone",
    images: [...product.media]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        src: item.publicPath,
        kind: item.kind,
        placeholder: item.isPlaceholder,
      })),
    approvedReviewCount: approved.length,
    averageRating: average,
  };
}

const productInclude = {
  translations: true,
  media: { orderBy: { sortOrder: "asc" as const } },
  reviews: {
    where: { status: "APPROVED" as const },
    select: { rating: true },
  },
};

export async function listProducts(locale: Locale): Promise<CatalogProduct[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: productInclude,
  });

  return rows.flatMap((row) => {
    const product = toCatalogProduct(row, locale);
    return product ? [product] : [];
  });
}

export async function getProductBySlug(
  locale: Locale,
  slug: string,
): Promise<CatalogProduct | null> {
  const row = await prisma.product.findFirst({
    where: { slug, published: true },
    include: productInclude,
  });
  if (!row) return null;
  return toCatalogProduct(row, locale);
}
