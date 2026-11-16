import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

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
  const ids = ["cmwjk12em0006dwqzar8x0vvo", "cmwjk162r000adwqzx6u6atsy", "cmwjk0y3y0003dwqz1xd2hphu"];
  const versions = await prisma.recipeVersion.findMany({ where: { recipeId: { in: ids } }, select: { id: true } });
  const versionIds = versions.map((row) => row.id);
  if (versionIds.length > 0) {
    await prisma.recipeIngredient.deleteMany({ where: { recipeVersionId: { in: versionIds } } });
    await prisma.recipeStep.deleteMany({ where: { recipeVersionId: { in: versionIds } } });
  }
  await prisma.recipeVersion.deleteMany({ where: { recipeId: { in: ids } } });
  await prisma.recipe.deleteMany({ where: { id: { in: ids } } });
  await prisma.ingredient.deleteMany({ where: { id: { in: ["cmwjk0nw80002dwqzi06sx07y", "cmwjk0la00001dwqzfcrmvyo4"] } } });
  console.log("cleaned");
}

main();
