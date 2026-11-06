import type { Metadata } from "next";
import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
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
    <AdminPage
      title={dict.admin.products}
      lede={dict.admin.priceHint}
      action={
        <Link href={`/${locale}/admin/products/new`} className="rounded-lg bg-[#e7d3bc] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a1612]">
          {dict.admin.create}
        </Link>
      }
    >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs tracking-[0.16em] text-[#9c9186] uppercase">
                <th className="py-3 pr-4 font-semibold">{dict.auth.name}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.slug}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.price}</th>
                <th className="py-3 pr-4 font-semibold">{dict.admin.published}</th>
                <th className="py-3 font-semibold"><span className="sr-only">{dict.admin.editAction}</span></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const name = product.translations.find((item) => item.locale === locale)?.name ?? product.slug;
                const photo = product.media[0]?.publicPath;
                return (
                  <tr key={product.id} className="border-b border-white/10">
                    <td className="py-3 pr-4">
                      <Link href={`/${locale}/admin/products/${product.id}`} className="flex items-center gap-3 font-semibold text-[#e7d3bc]">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt="" className="h-14 w-11 object-cover" />
                        ) : null}
                        {name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{product.slug}</td>
                    <td className="py-3 pr-4">
                      <Price amountMinor={product.priceMinor} locale={locale} comingSoon={dict.price.comingSoon} />
                    </td>
                    <td className="py-3 pr-4">{product.published ? dict.admin.published : "—"}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/${locale}/admin/products/${product.id}`}
                        className="inline-flex rounded-lg bg-[#e7d3bc] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1612]"
                      >
                        {dict.admin.editAction}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </AdminPage>
  );
}
