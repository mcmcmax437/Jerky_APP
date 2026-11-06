import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const clientVersion = "11";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaVersion?: string };

function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST ?? "127.0.0.1",
    port: Number(process.env.DATABASE_PORT ?? 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
    // MySQL 8 caching_sha2_password needs the RSA key on a fresh local connection.
    // This is safe only because the database is on this machine, without TLS.
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({ adapter });
}

if (globalForPrisma.prismaVersion !== clientVersion) {
  globalForPrisma.prisma = createPrismaClient();
  globalForPrisma.prismaVersion = clientVersion;
}

export const prisma = globalForPrisma.prisma as PrismaClient;
