import { MOCK_ORDERS } from "../data/mockOrders.js";
import type { OrderStatus } from "../types.js";

export const ORDER_REGEX = /(订单|order)\s*#?\s*(\d{6,})/i;

export function extractOrderId(text: string): string | null {
  const matched = text.match(ORDER_REGEX);
  if (!matched) return null;
  return matched[2] ?? null;
}

export function getOrderStatus(orderId: string): OrderStatus {
  const found = MOCK_ORDERS[orderId];
  if (found) return found;

  return {
    orderId,
    status: "未找到订单",
    updatedAt: new Date().toISOString(),
    warehouse: "未知",
    eta: "请确认订单号是否正确",
  };
}
