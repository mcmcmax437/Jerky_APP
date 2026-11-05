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
  return { title: dict.auth.registerTitle, description: dict.auth.registerLede };
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const session = await getSession();
  const query = await searchParams;
  if (session) redirect(safeNext(query.next, `/${locale}/account`));

  return (
    <>
      <PageIntro eyebrow={dict.auth.registerEyebrow} title={dict.auth.registerTitle} lede={dict.auth.registerLede} />
      <PageBody>
        <AuthForm mode="register" locale={locale} dict={dict} next={query.next} />
      </PageBody>
    </>
  );
}
