import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/features/auth/password";

function readEnv(path: string) {
  const values = new Map<string, string>();
  for (const line of readFileSync(path, "utf8").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const split = trimmed.indexOf("=");
    if (split < 0) continue;
    const key = trimmed.slice(0, split).trim();
    let value = trimmed.slice(split + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values.set(key, value);
  }
  return values;
}

const env = readEnv(".env");
const email = (env.get("ADMIN_EMAIL") ?? "").trim().toLowerCase();
const password = env.get("ADMIN_PASSWORD") ?? "";

if (!email || password.length < 8) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD in .env must be set, and the password must be at least 8 characters.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: env.get("DATABASE_HOST") ?? "127.0.0.1",
    port: Number(env.get("DATABASE_PORT") ?? 3306),
    user: env.get("DATABASE_USER"),
    password: env.get("DATABASE_PASSWORD"),
    database: env.get("DATABASE_NAME"),
    connectionLimit: 1,
    allowPublicKeyRetrieval: true,
  }),
});

async function main() {
  const passwordHash = await hashPassword(password);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, name: "Admin", role: "ADMIN", passwordHash },
  });
  console.log(`Admin ${email} matches .env.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : "The admin account could not be saved.";
    console.error(password ? message.replaceAll(password, "***") : message);
    await prisma.$disconnect();
    process.exit(1);
  });
