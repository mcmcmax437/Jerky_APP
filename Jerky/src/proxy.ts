import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const floodWindowMs = 10_000;
const floodMax = 120;
const floods = new Map<string, { count: number; start: number }>();

function isAppDataRead(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const headers = request.headers;
  if (headers.get("next-router-prefetch")) return true;
  const purpose = `${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`.toLowerCase();
  if (purpose.includes("prefetch")) return true;
  if (headers.has("rsc")) return true;
  if (headers.get("accept")?.includes("text/x-component")) return true;
  return false;
}

function flooded(request: NextRequest) {
  const now = Date.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip || ip.length > 80) return false;
  const current = floods.get(ip);
  if (!current || now - current.start > floodWindowMs) {
    floods.set(ip, { count: 1, start: now });
    if (floods.size > 5000) {
      for (const [key, value] of floods) {
        if (now - value.start > floodWindowMs) floods.delete(key);
      }
    }
    return false;
  }
  current.count += 1;
  return current.count > floodMax;
}

const locales = ["pl", "uk", "en"] as const;
type Locale = (typeof locales)[number];

function localeFromPath(pathname: string): Locale | undefined {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.includes("/admin/") || pathname.endsWith("/admin");
  if (!isAdmin && !isAppDataRead(request) && flooded(request)) {
    return new NextResponse("Too many requests", { status: 429, headers: { "Retry-After": "10" } });
  }
  const existing = localeFromPath(pathname);

  if (existing) {
    const headers = new Headers(request.headers);
    headers.set("x-locale", existing);
    headers.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/pl" : `/pl${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/|demo/|home/|catalog/|icon.svg|favicon.ico).*)"],
};
