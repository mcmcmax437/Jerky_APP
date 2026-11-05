import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/features/auth/password";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
  }),
});

const products = [
  {
    slug: "original",
    accent: "bone",
    sortOrder: 1,
    packshot: "/catalog/original.jpg",
    translations: {
      pl: {
        name: "ORIGINAL",
        profile:
          "Roboczy kierunek: klasyczny profil wołowy. Czosnek i czarny pieprz pojawią się w opisie tylko wtedy, gdy wejdą do zatwierdzonej receptury.",
      },
      uk: {
        name: "ORIGINAL",
        profile:
          "Робочий напрям: класичний яловичий профіль. Часник і чорний перець з’являться в описі лише якщо увійдуть до затвердженої рецептури.",
      },
      en: {
        name: "ORIGINAL",
        profile:
          "Working direction: a classic beef profile. Garlic and black pepper will be named only if they are part of the approved recipe.",
      },
    },
  },
  {
    slug: "teriyaki",
    accent: "teriyaki",
    sortOrder: 2,
    packshot: "/catalog/teriyaki.jpg",
    translations: {
      pl: {
        name: "TERIYAKI",
        profile:
          "Roboczy kierunek: słodko-słony, inspirowany sosem sojowym i imbirem. Skład nie jest zatwierdzony.",
      },
      uk: {
        name: "TERIYAKI",
        profile:
          "Робочий напрям: солодко-солоний, з орієнтиром на соєвий соус та імбир. Склад ще не затверджено.",
      },
      en: {
        name: "TERIYAKI",
        profile:
          "Working direction: sweet-salty, pointing toward soy and ginger. The ingredient list is not approved.",
      },
    },
  },
  {
    slug: "hot-chili",
    accent: "chili",
    sortOrder: 3,
    packshot: "/catalog/hot-chili.jpg",
    translations: {
      pl: {
        name: "HOT CHILI",
        profile:
          "Roboczy kierunek: ostry, z chili. Poziom ostrości i skład ustali seria testów, nie ten opis.",
      },
      uk: {
        name: "HOT CHILI",
        profile:
          "Робочий напрям: гострий, з чилі. Рівень гостроти й склад визначить серія тестів, не цей текст.",
      },
      en: {
        name: "HOT CHILI",
        profile:
          "Working direction: hot, with chili. Heat level and ingredients will be set by tests, not by this text.",
      },
    },
  },
] as const;

async function main() {
  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        accent: item.accent,
        netWeightG: 100,
        currency: "PLN",
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
        update: {},
        create: { productId: product.id, locale, ...copy },
      });
    }

    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    await prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          kind: "packshot",
          sortOrder: 0,
          publicPath: item.packshot,
          isPlaceholder: true,
        },
        {
          productId: product.id,
          kind: "texture",
          sortOrder: 1,
          publicPath: "/demo/texture.svg",
          isPlaceholder: true,
        },
      ],
    });
  }

  const settings = [
    ["defaultLocale", "pl"],
    ["currency", "PLN"],
    ["market", "PL"],
  ] as const;

  for (const [key, value] of settings) {
    await prisma.adminSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (adminEmail && adminPassword.length >= 8) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        name: "Admin",
        passwordHash: await hashPassword(adminPassword),
      },
      create: {
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
        passwordHash: await hashPassword(adminPassword),
      },
    });
  } else {
    console.warn("ADMIN_EMAIL and ADMIN_PASSWORD are missing, so no admin account was created.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
