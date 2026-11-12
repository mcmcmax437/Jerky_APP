import type { Metadata } from "next";
import { headers } from "next/headers";
import { CartProvider } from "@/features/cart/cart-context";
import { isSiteClosed } from "@/features/admin/queries";
import { recordVisit } from "@/features/site/visits";
import { getSession } from "@/features/auth/session";
import { ClosedSite } from "@/components/site/ClosedSite";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/locales";
import { readLocale } from "@/lib/i18n/request";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { description: dict.meta.description };
}

export function generateStaticParams() {
  return [{ locale: "pl" }, { locale: "uk" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const session = await getSession();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`);
  const isLogin = pathname === `/${locale}/login`;
  const staff = session?.role === "ADMIN";

  if ((await isSiteClosed()) && !staff && !isAdmin && !isLogin) {
    return <ClosedSite locale={locale} dict={dict} />;
  }

  if (!isAdmin && pathname) await recordVisit(locale, pathname);

  if (isAdmin) {
    return (
      <CartProvider>
        <div className="flex min-h-screen flex-col bg-[#100e0c]">
          <Header locale={locale} dict={dict} role={session?.role ?? null} />
          <main id="content" className="flex flex-1 flex-col">
            {children}
          </main>
        </div>
      </CartProvider>
    );
  }

  return (
    <>
      <a
        href="#content"
        className="absolute left-4 top-4 -translate-y-24 bg-ivory-100 px-3 py-2 text-sm text-text-dark focus:translate-y-0"
      >
        {dict.nav.skip}
      </a>
      <div className="min-h-screen flex flex-col">
        <CartProvider>
          <Header locale={locale} dict={dict} role={session?.role ?? null} />
          <main id="content" className="flex-1">
            {children}
          </main>
        </CartProvider>
        <Footer locale={locale} dict={dict} />
      </div>
    </>
  );
}
