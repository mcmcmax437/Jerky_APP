export const orderStatuses = ["NEW", "IN_PROCESS", "READY", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export type OrderStatusName = (typeof orderStatuses)[number];

export function isOrderStatus(value: string): value is OrderStatusName {
  return (orderStatuses as readonly string[]).includes(value);
}

export const orderStatusTone: Record<OrderStatusName, string> = {
  NEW: "bg-[#3a342c] text-[#f3efe6]",
  IN_PROCESS: "bg-[#6b4a2e] text-[#f6e2cc]",
  CANCELLED: "bg-[#5c2422] text-[#f6d2ce]",
  READY: "bg-[#8a6234] text-[#fff1dc]",
  PACKING: "bg-[#4a3b28] text-[#f3e6d0]",
  SHIPPED: "bg-[#2d4a62] text-[#d7ebf8]",
  DELIVERED: "bg-[#1f4a38] text-[#d7f3e4]",
};
