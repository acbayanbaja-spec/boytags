import { prisma } from "../config/db.js";

/** Runs on the caller's client. Inside a transaction it must receive `tx`, otherwise Prisma opens a
 *  second pooled connection while the transaction is holding one. */
export async function nextOrderNumber(client = prisma) {
  const last = await client.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });
  const n = last?.orderNumber ? Number(last.orderNumber.replace("BT-", "")) : 1000;
  const next = Number.isFinite(n) ? n + 1 : 1001;
  return `BT-${String(next).padStart(4, "0")}`;
}

export function computePriority(order, now = new Date()) {
  if (order.status === "UNCLAIMED") return "URGENT";
  const scheduled = new Date(order.scheduledAt);
  const diffMin = (scheduled.getTime() - now.getTime()) / 60000;
  if (diffMin < 0 && !["COMPLETED", "CANCELLED"].includes(order.status)) return "URGENT";
  if (diffMin <= 30 && !["COMPLETED", "CANCELLED"].includes(order.status)) return "HIGH";
  return "NORMAL";
}
