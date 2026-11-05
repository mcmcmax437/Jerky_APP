import type { Metadata } from "next";
import Link from "next/link";
import { PageBody, PageIntro } from "@/components/layout/PageIntro";
import { Price } from "@/components/product/Price";
import { listAdminProducts } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.products };
}

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await readLocale(params);
  const products = await listAdminProducts();

  return (
    <>
      <PageIntro eyebrow={dict.admin.overviewEyebrow} title={dict.admin.products} lede={dict.admin.priceHint} />
      <PageBody>
        <Link href={`/${locale}/admin/products/new`} className="w-fit bg-ink-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-light">
          {dict.admin.create}
        </Link>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-800/15 text-xs uppercase tracking-[0.16em]">
                <th className="py-3 pr-4 font-semibold">{dict.auth.name}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.slug}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.price}</th>
                <th className="py-3 font-semibold">{dict.admin.published}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const name = product.translations.find((item) => item.locale === locale)?.name ?? product.slug;
                return (
                  <tr key={product.id} className="border-b border-ink-800/10">
                    <td className="py-3 pr-4">
                      <Link href={`/${locale}/admin/products/${product.id}`} className="font-semibold underline">
                        {name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{product.slug}</td>
                    <td className="py-3 pr-4">
                      <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                    </td>
                    <td className="py-3">{product.published ? dict.admin.published : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageBody>
    </>
  );
}
