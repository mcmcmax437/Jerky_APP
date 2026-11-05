import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["pl", "uk", "en"] as const;
type Locale = (typeof locales)[number];

function localeFromPath(pathname: string): Locale | undefined {
  return locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const existing = localeFromPath(pathname);

  if (existing) {
    const headers = new Headers(request.headers);
    headers.set("x-locale", existing);
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/pl" : `/pl${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/|demo/|home/|catalog/|icon.svg|favicon.ico).*)"],
};
