import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { listAdminReviews } from "@/features/admin/queries";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.terminal.reviews };
}

export default async function AdminReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await readLocale(params);
  const reviews = await listAdminReviews();

  return (
    <AdminPage title={dict.admin.terminal.reviews} lede={reviews.length === 0 ? dict.admin.terminal.moduleEmpty : undefined}>
      {reviews.length === 0 ? null : (
        <ul className="grid gap-3">
          {reviews.map((review) => {
            const name = review.product.translations.find((item) => item.locale === locale)?.name ?? review.product.slug;
            return (
              <li key={review.id} className="rounded-xl border border-white/10 px-4 py-3 text-sm">
                <span className="text-[#e7d3bc]">{name}</span>
                <span className="mx-2 text-[#9c9186]">{review.rating} / 5</span>
                <span>{review.displayName}</span>
                <span className="ml-2 text-[#9c9186]">{review.status}</span>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPage>
  );
}
