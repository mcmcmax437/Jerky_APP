import { prisma } from "@/lib/db/prisma";
import { isLocale } from "@/lib/i18n/locales";

const prefix = "visit:";
const pathPattern = /^\/[a-z0-9/-]{0,60}$/;
const dayMs = 24 * 60 * 60 * 1000;

/** Counts are stored in AdminSetting as `visit:<locale>:<path>:<yyyy-mm-dd>`. */
export async function recordVisit(locale: string, pathname: string) {
  if (!isLocale(locale) || !pathPattern.test(pathname)) return;
  const key = `${prefix}${locale}:${pathname}:${new Date().toISOString().slice(0, 10)}`;
  try {
    const existing = await prisma.adminSetting.findUnique({ where: { key }, select: { value: true } });
    if (existing) {
      const hits = Number(existing.value);
      await prisma.adminSetting.update({
        where: { key },
        data: { value: String(Number.isFinite(hits) ? hits + 1 : 1) },
      });
      return;
    }
    await prisma.adminSetting.create({ data: { key, value: "1" } });
  } catch {
    // A broken counter must never break a page render.
  }
}

export async function listVisitCounts(days: number) {
  const cutoff = new Date(Date.now() - days * dayMs).toISOString().slice(0, 10);
  const rows = await prisma.adminSetting.findMany({
    where: { key: { startsWith: prefix } },
    select: { key: true, value: true },
  });

  return rows.flatMap((row) => {
    const parts = row.key.split(":");
    if (parts.length !== 4) return [];
    const [, locale, path, date] = parts;
    const hits = Number(row.value);
    if (!isLocale(locale) || !Number.isFinite(hits) || hits < 1) return [];
    if (date < cutoff) return [];
    return [{ locale, path, date, hits }];
  });
}
