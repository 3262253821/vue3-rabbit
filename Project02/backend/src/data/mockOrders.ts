import type { OrderStatus } from "../types.js";

export const MOCK_ORDERS: Record<string, OrderStatus> = {
  "20260001": {
    orderId: "20260001",
    status: "已发货",
    updatedAt: "2026-04-16 14:20:00",
    warehouse: "华东仓",
    eta: "2026-04-18",
  },
  "20260002": {
    orderId: "20260002",
    status: "待支付",
    updatedAt: "2026-04-17 09:15:00",
    warehouse: "未分配",
    eta: "支付后预计2天内发货",
  },
  "20260003": {
    orderId: "20260003",
    status: "运输中",
    updatedAt: "2026-04-17 08:44:00",
    warehouse: "华南仓",
    eta: "2026-04-19",
  },
  "20260004": {
    orderId: "20260004",
    status: "已签收",
    updatedAt: "2026-04-15 18:32:00",
    warehouse: "华北仓",
    eta: "已完成",
  },
};
