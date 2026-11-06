import type { PrismaClient } from "../src/generated/prisma/client";
import { catalogProducts } from "./catalog";

export async function syncCatalog(prisma: PrismaClient) {
  for (const item of catalogProducts) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        accent: item.accent,
        sortOrder: item.sortOrder,
        netWeightG: 100,
        currency: "PLN",
        published: true,
      },
      create: {
        slug: item.slug,
        accent: item.accent,
        sortOrder: item.sortOrder,
        netWeightG: 100,
        published: true,
        priceMinor: null,
        currency: "PLN",
      },
    });

    for (const [locale, copy] of Object.entries(item.translations)) {
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: product.id, locale } },
        update: { name: copy.name, card: copy.card, profile: copy.profile },
        create: { productId: product.id, locale, name: copy.name, card: copy.card, profile: copy.profile },
      });
    }

    const media = await prisma.productMedia.count({ where: { productId: product.id } });
    if (media === 0) {
      await prisma.productMedia.create({
        data: {
          productId: product.id,
          kind: "packshot",
          sortOrder: 0,
          publicPath: item.packshot,
          isPlaceholder: true,
        },
      });
    }
  }
}
