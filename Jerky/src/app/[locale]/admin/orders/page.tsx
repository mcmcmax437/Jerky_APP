import type { Metadata } from "next";
import { AdminPage } from "@/components/admin/AdminPage";
import { OrderBoard } from "@/components/admin/OrderBoard";
import { listAdminOrders } from "@/features/admin/queries";
import { formatDate } from "@/lib/format";
import { readLocale } from "@/lib/i18n/request";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { dict } = await readLocale(params);
  return { title: dict.admin.orders };
}

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await readLocale(params);
  const orders = await listAdminOrders({});

  return (
    <AdminPage title={dict.admin.orders} lede={dict.admin.testBanner}>
      <OrderBoard
        locale={locale}
        orders={orders.map((order) => ({
          id: order.id,
          number: order.number,
          status: order.status,
          customerName: order.customerName,
          totalMinor: order.totalMinor,
          dateLabel: formatDate(order.createdAt, locale),
        }))}
        labels={dict.admin.statuses}
        searchLabel={dict.admin.search}
        emptyLabel={dict.admin.empty}
        comingSoon={dict.price.comingSoon}
        dict={dict}
      />
    </AdminPage>
  );
}
