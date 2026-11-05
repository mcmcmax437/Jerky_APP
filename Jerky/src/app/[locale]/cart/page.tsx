import type { Metadata } from "next";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { CartView } from "@/components/cart/CartView";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.cart.title };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);

  return (
    <>
      <PageIntro eyebrow={dict.cart.eyebrow} title={dict.cart.title} lede={dict.cart.note} />
      <PageBody>
        <CartView locale={locale} dict={dict} />
      </PageBody>
    </>
  );
}
