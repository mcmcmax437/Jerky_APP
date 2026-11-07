import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export type RateRule = {
  limit: number;
  windowMs: number;
  lockMs: number;
};

export const buckets = {
  loginEmail: { limit: 8, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  loginIp: { limit: 20, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  registerIp: { limit: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  supportUser: { limit: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  supportIp: { limit: 8, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  checkoutIp: { limit: 8, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  passwordUser: { limit: 8, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
} as const satisfies Record<string, RateRule>;

type RateState = {
  hits: number;
  windowStart: number;
  lockedUntil: number | null;
};

export function rateDecision(state: RateState | null, now: number, rule: RateRule): { allow: boolean } & RateState {
  if (state?.lockedUntil != null && state.lockedUntil > now) {
    return { allow: false, hits: state.hits, windowStart: state.windowStart, lockedUntil: state.lockedUntil };
  }

  const fresh = state == null || now - state.windowStart >= rule.windowMs;
  const hits = fresh ? 1 : state.hits + 1;
  const windowStart = fresh ? now : state.windowStart;
  if (hits > rule.limit) {
    return { allow: false, hits, windowStart, lockedUntil: now + rule.lockMs };
  }
  return { allow: true, hits, windowStart, lockedUntil: null };
}

function clip(key: string) {
  return key.slice(0, 190);
}

export async function take(bucket: string, key: string, rule: RateRule): Promise<boolean> {
  const safeKey = clip(key);
  const now = Date.now();
  const row = await prisma.rateLimit.findUnique({ where: { bucket_key: { bucket, key: safeKey } } });
  const decision = rateDecision(
    row
      ? { hits: row.hits, windowStart: row.windowStart.getTime(), lockedUntil: row.lockedUntil?.getTime() ?? null }
      : null,
    now,
    rule,
  );
  const data = {
    hits: decision.hits,
    windowStart: new Date(decision.windowStart),
    lockedUntil: decision.lockedUntil == null ? null : new Date(decision.lockedUntil),
  };
  await prisma.rateLimit.upsert({
    where: { bucket_key: { bucket, key: safeKey } },
    create: { bucket, key: safeKey, ...data },
    update: data,
  });
  return decision.allow;
}

export async function isLocked(bucket: string, key: string) {
  const row = await prisma.rateLimit.findUnique({ where: { bucket_key: { bucket, key: clip(key) } } });
  return row?.lockedUntil != null && row.lockedUntil.getTime() > Date.now();
}

export async function clearLimit(bucket: string, key: string) {
  await prisma.rateLimit.deleteMany({ where: { bucket, key: clip(key) } });
}

export function isSpamTrap(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function clientAddress() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded && forwarded.length <= 80 && !/\s/.test(forwarded)) return forwarded;
  const real = headerList.get("x-real-ip")?.trim();
  if (real && real.length <= 80 && !/\s/.test(real)) return real;
  return "local";
}
