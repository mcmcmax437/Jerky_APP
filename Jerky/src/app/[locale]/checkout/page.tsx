import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getSession } from "@/features/auth/session";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.checkout.title, description: dict.checkout.lede };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const session = await getSession();

  return (
    <>
      <PageIntro eyebrow={dict.checkout.eyebrow} title={dict.checkout.title} lede={dict.checkout.lede} />
      <PageBody>
        <CheckoutForm
          locale={locale}
          dict={dict}
          defaults={session ? { customerName: session.name, email: session.email } : undefined}
        />
      </PageBody>
    </>
  );
}
