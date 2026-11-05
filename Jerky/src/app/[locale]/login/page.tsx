import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSession, safeNext } from "@/features/auth/session";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.auth.loginTitle, description: dict.auth.loginLede };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const session = await getSession();
  const query = await searchParams;
  if (session) {
    redirect(safeNext(query.next, session.role === "ADMIN" ? `/${locale}/admin` : `/${locale}/account`));
  }

  return (
    <>
      <PageIntro eyebrow={dict.auth.loginEyebrow} title={dict.auth.loginTitle} lede={dict.auth.loginLede} />
      <PageBody>
        <AuthForm mode="login" locale={locale} dict={dict} next={query.next} />
      </PageBody>
    </>
  );
}
