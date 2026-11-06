import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/features/auth/password";
import { syncCatalog } from "./sync-catalog";

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

async function main() {
  await syncCatalog(prisma);

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
