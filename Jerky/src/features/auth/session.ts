import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

const cookieName = "jerky_session";
const lifetimeMs = 14 * 24 * 60 * 60 * 1000;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + lifetimeMs);
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.set(cookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) return null;
  const row = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!row || row.expiresAt.getTime() <= Date.now()) return null;
  return {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    role: row.user.role,
  };
}

export function safeNext(value: string | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (!/^\/(pl|uk|en)(\/|$)/.test(value)) return fallback;
  return value;
}
