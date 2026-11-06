import { orderStatusTone, type OrderStatusName } from "@/features/admin/order-status";

export function OrderStatusPill({ status, label }: { status: OrderStatusName; label: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${orderStatusTone[status]}`}>{label}</span>;
}
