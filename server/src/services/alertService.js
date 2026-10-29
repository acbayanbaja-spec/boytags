import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/http.js";
import { computePriority } from "../utils/orderNumber.js";
import { notifyStaff, notifyUser } from "./notificationService.js";
import { realtime } from "../realtime/hub.js";
import { logger } from "../utils/logger.js";

export async function listAlerts(status) {
  return prisma.alert.findMany({
    where: status ? { status } : undefined,
    include: {
      order: {
        include: {
          customer: { select: { name: true, phone: true } },
          items: true,
        },
      },
      acknowledgedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
}

export async function acknowledgeAlert(id, actor) {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) throw new AppError("Alert not found.", 404, "NOT_FOUND");
  const updated = await prisma.alert.update({
    where: { id },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedById: actor.sub,
      acknowledgedAt: new Date(),
    },
  });
  realtime.broadcast({ type: "alerts", audience: "staff" });
  return updated;
}

export async function resolveAlert(id, actor) {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) throw new AppError("Alert not found.", 404, "NOT_FOUND");
  return prisma.alert.update({
    where: { id },
    data: {
      status: "RESOLVED",
      acknowledgedById: actor.sub,
      acknowledgedAt: alert.acknowledgedAt || new Date(),
    },
  });
}

export async function processUnclaimedOrders() {
  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  if (!settings) return { scanned: 0, marked: 0 };
  const thresholdMs = settings.unclaimedThresholdMinutes * 60 * 1000;
  const cutoff = new Date(Date.now() - thresholdMs);
  const candidates = await prisma.order.findMany({
    where: {
      status: { in: ["READY", "OUT_FOR_DELIVERY"] },
      // Measure the wait from when the kitchen actually finished the order; scheduledAt is
      // only the fallback for orders that reached READY before readyAt was tracked.
      OR: [{ readyAt: { not: null, lte: cutoff } }, { readyAt: null, scheduledAt: { lte: cutoff } }],
    },
    include: { customer: true, items: true },
  });

  let marked = 0;
  for (const order of candidates) {
    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "UNCLAIMED",
          unclaimedAt: new Date(),
          priority: "URGENT",
        },
      });
      await tx.orderHistory.create({
        data: {
          orderId: order.id,
          actorRole: "SYSTEM",
          actorName: "Unclaimed watcher",
          action: "UNCLAIMED",
          previousValue: { status: order.status },
          newValue: { status: "UNCLAIMED", scheduledAt: order.scheduledAt },
        },
      });
      const existing = await tx.alert.findFirst({
        where: { orderId: order.id, type: "UNCLAIMED_ORDER", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      });
      if (!existing) {
        await tx.alert.create({
          data: {
            type: "UNCLAIMED_ORDER",
            message: `Unclaimed order ${order.orderNumber} — scheduled ${order.scheduledAt.toISOString()}`,
            orderId: order.id,
          },
        });
      }
      return next;
    });

    await notifyStaff({
      type: "UNCLAIMED",
      title: "Unclaimed order",
      body: `${order.orderNumber} is past its scheduled time and still waiting.`,
      orderId: order.id,
    });
    await notifyUser({
      userId: order.customerId,
      type: "UNCLAIMED",
      title: "We are holding your order",
      body: `${order.orderNumber} is waiting. Please claim it or contact the store.`,
      orderId: order.id,
    });
    realtime.broadcast({ type: "order", audience: "all", orderId: order.id, userId: order.customerId });
    realtime.broadcast({
      type: "order-unclaimed",
      audience: "all",
      orderId: order.id,
      userId: order.customerId,
      orderNumber: order.orderNumber,
      waitedMinutes: Math.round((Date.now() - new Date(order.readyAt || order.scheduledAt).getTime()) / 60000),
    });
    marked += 1;
    logger.info("Marked unclaimed order", { orderNumber: order.orderNumber });
    void updated;
  }

  const active = await prisma.order.findMany({ where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] } } });
  for (const order of active) {
    const priority = computePriority(order);
    if (priority !== order.priority) {
      await prisma.order.update({ where: { id: order.id }, data: { priority } });
    }
  }

  return { scanned: candidates.length, marked };
}

/**
 * Auto-expire sweep: orders whose scheduled time passed without being fulfilled
 * (and without kitchen confirmation while still PENDING) are cancelled, restocked,
 * and removed from every live view so the queue only ever shows work that can happen.
 */
export async function processExpiredOrders() {
  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const graceMs = (settings?.autoCancelGraceMinutes ?? 15) * 60 * 1000;
  const now = new Date();
  const overdueCutoff = new Date(now.getTime() - graceMs);

  const candidates = await prisma.order.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
      OR: [
        { autoCancelAt: { not: null, lte: now } },
        { autoCancelAt: null, scheduledAt: { lte: overdueCutoff } },
      ],
    },
    include: { items: true, customer: true },
  });

  let expired = 0;
  for (const order of candidates) {
    const reason = `Auto-expired: the ${order.type === "DELIVERY" ? "delivery" : "pickup"} time passed and the order was never fulfilled.`;
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const restocked = await tx.product.update({
          where: { id: item.productId },
          data: { availableQty: { increment: item.quantity } },
        });
        // Derive availability from the real quantity instead of assuming the item is back in stock.
        await tx.product.update({
          where: { id: restocked.id },
          data: { soldOut: restocked.availableQty <= 0 },
        });
        if (restocked.availableQty > 0) {
          await tx.alert.updateMany({
            where: { productId: restocked.id, type: "SOLD_OUT", status: "OPEN" },
            data: { status: "RESOLVED" },
          });
        }
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", cancelReason: reason, priority: "NORMAL", autoCancelAt: null },
      });
      await tx.orderHistory.create({
        data: {
          orderId: order.id,
          actorRole: "SYSTEM",
          actorName: "Expiry watcher",
          action: "AUTO_EXPIRED",
          previousValue: { status: order.status },
          newValue: { status: "CANCELLED", reason },
        },
      });
      const existing = await tx.alert.findFirst({
        where: { orderId: order.id, type: "UNCLAIMED_ORDER", status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      });
      if (!existing) {
        await tx.alert.create({
          data: { type: "UNCLAIMED_ORDER", message: `Expired order ${order.orderNumber} auto-cancelled.`, orderId: order.id },
        });
      }
    });

    await notifyUser({
      userId: order.customerId,
      type: "AUTO_EXPIRED",
      title: `Order ${order.orderNumber} expired`,
      body: `Its ${order.type === "DELIVERY" ? "delivery" : "pickup"} time passed without fulfilment, so it was automatically cancelled and removed from the queue. Stock has been returned.`,
      orderId: order.id,
    });
    await notifyStaff({
      type: "AUTO_EXPIRED",
      title: `Order ${order.orderNumber} auto-expired`,
      body: `Unfulfilled past its scheduled time — cancelled and restocked automatically.`,
      orderId: order.id,
    });
    realtime.broadcast({
      type: "order-expired",
      audience: "all",
      orderId: order.id,
      userId: order.customerId,
      orderNumber: order.orderNumber,
      status: "CANCELLED",
    });
    realtime.broadcast({ type: "inventory", audience: "all" });
    expired += 1;
    logger.info("Auto-expired order", { orderNumber: order.orderNumber });
  }

  return { scanned: candidates.length, expired };
}

export function startUnclaimedJob(intervalMs) {
  const run = async () => {
    try {
      await processExpiredOrders();
    } catch (error) {
      logger.error("Expiry job failed", { message: error.message });
    }
    processUnclaimedOrders().catch((error) => logger.error("Unclaimed job failed", { message: error.message }));
  };
  run();
  return setInterval(run, intervalMs);
}
