import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/http.js";
import { computePriority, nextOrderNumber } from "../utils/orderNumber.js";
import {
  ACTIVE_QUEUE_STATUSES,
  assertTransition,
  customerCanCancel,
  customerCanEdit,
} from "../utils/statusMachine.js";
import { notifyStaff, notifyUser } from "./notificationService.js";
import { realtime } from "../realtime/hub.js";

function money(value) {
  return Number(value);
}

const DEFAULT_AUTO_CANCEL_GRACE_MINUTES = 15;
const MAX_SCHEDULE_AHEAD_MS = 7 * 24 * 60 * 60 * 1000;

function graceMinutes(settings) {
  return settings?.autoCancelGraceMinutes ?? DEFAULT_AUTO_CANCEL_GRACE_MINUTES;
}

function autoCancelDeadline(scheduledAt, settings) {
  return new Date(new Date(scheduledAt).getTime() + graceMinutes(settings) * 60 * 1000);
}

function serializeOrder(order) {
  const priority = computePriority(order);
  return {
    ...order,
    priority,
    subtotal: money(order.subtotal),
    deliveryFee: money(order.deliveryFee),
    total: money(order.total),
    items: order.items?.map((item) => ({
      ...item,
      unitPrice: money(item.unitPrice),
      lineTotal: money(item.lineTotal),
    })),
    delivery: order.delivery
      ? {
          ...order.delivery,
          latitude: money(order.delivery.latitude),
          longitude: money(order.delivery.longitude),
        }
      : null,
  };
}

function deliverySnapshot(delivery) {
  if (!delivery) return null;
  return {
    address: delivery.address ?? null,
    landmark: delivery.landmark ?? null,
    notes: delivery.notes ?? null,
    contactPhone: delivery.contactPhone ?? null,
    latitude: delivery.latitude == null ? null : money(delivery.latitude),
    longitude: delivery.longitude == null ? null : money(delivery.longitude),
  };
}

async function recordHistory(tx, { orderId, actor, action, previousValue, newValue }) {
  await tx.orderHistory.create({
    data: {
      orderId,
      actorId: actor?.id || actor?.sub || null,
      actorRole: actor?.role || "SYSTEM",
      actorName: actor?.name || actor?.email || "System",
      action,
      previousValue: previousValue ?? Prisma.JsonNull,
      newValue: newValue ?? Prisma.JsonNull,
    },
  });
}

async function raiseAlertOnce(tx, { type, productId, message }) {
  const existing = await tx.alert.findFirst({
    where: { type, productId, status: "OPEN" },
  });
  if (existing) return;
  await tx.alert.create({ data: { type, message, productId } });
}

async function applyInventory(tx, items, direction) {
  const settings = await tx.setting.findUnique({ where: { id: "default" } });
  const lowStockThreshold = settings?.lowStockThreshold ?? 0;
  for (const item of items) {
    let product;
    if (direction === "decrement") {
      const result = await tx.product.updateMany({
        where: {
          id: item.productId,
          active: true,
          availableQty: { gte: item.quantity },
        },
        data: { availableQty: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        const missing = await tx.product.findUnique({ where: { id: item.productId } });
        throw new AppError(
          missing
            ? `${missing.name} does not have enough stock for this order.`
            : "One of the products is no longer available.",
          409,
          "INVENTORY",
        );
      }
      product = await tx.product.findUnique({ where: { id: item.productId } });
    } else {
      product = await tx.product.update({
        where: { id: item.productId },
        data: { availableQty: { increment: item.quantity } },
      });
    }

    const soldOut = product.availableQty <= 0;
    if (soldOut !== product.soldOut) {
      await tx.product.update({ where: { id: product.id }, data: { soldOut } });
    }

    if (direction === "decrement") {
      if (soldOut) {
        await raiseAlertOnce(tx, {
          type: "SOLD_OUT",
          productId: product.id,
          message: `${product.name} is sold out.`,
        });
      } else if (product.availableQty <= lowStockThreshold) {
        await raiseAlertOnce(tx, {
          type: "LOW_STOCK",
          productId: product.id,
          message: `${product.name} is low on stock (${product.availableQty} left).`,
        });
      }
    } else {
      // Stock came back, so the previous "out of stock" warnings are no longer true.
      await tx.alert.updateMany({
        where: { productId: product.id, type: "SOLD_OUT", status: "OPEN" },
        data: { status: "RESOLVED" },
      });
      if (product.availableQty > lowStockThreshold) {
        await tx.alert.updateMany({
          where: { productId: product.id, type: "LOW_STOCK", status: "OPEN" },
          data: { status: "RESOLVED" },
        });
      }
    }
  }
}

async function hydrateItems(tx, items) {
  const ids = items.map((item) => item.productId);
  const products = await tx.product.findMany({ where: { id: { in: ids }, active: true } });
  const map = new Map(products.map((p) => [p.id, p]));
  return items.map((item) => {
    const product = map.get(item.productId);
    if (!product) throw new AppError("A selected product is no longer available.", 400, "INVALID_PRODUCT");
    if (product.soldOut || product.availableQty <= 0) {
      throw new AppError(`${product.name} is sold out.`, 409, "SOLD_OUT");
    }
    const lineTotal = Number(product.price) * item.quantity;
    return {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal,
    };
  });
}

function orderIncludes() {
  return {
    items: {
      include: {
        product: {
          select: { imageUrl: true, slug: true, name: true, description: true, active: true, soldOut: true, availableQty: true },
        },
      },
    },
    delivery: true,
    customer: { select: { id: true, name: true, email: true, phone: true } },
  };
}

export async function createOrder(customer, input) {
  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < new Date(Date.now() - 60000)) {
    throw new AppError("Choose a valid future pickup or delivery time.", 422, "INVALID_SCHEDULE");
  }
  if (scheduledAt.getTime() > Date.now() + MAX_SCHEDULE_AHEAD_MS) {
    throw new AppError("Orders can only be scheduled up to 7 days ahead.", 422, "INVALID_SCHEDULE");
  }

  const order = await prisma.$transaction(async (tx) => {
    const lines = await hydrateItems(tx, input.items);
    await applyInventory(tx, lines, "decrement");
    const subtotal = lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
    const deliveryFee = input.type === "DELIVERY" ? Number(settings?.deliveryFee || 0) : 0;
    const created = await tx.order.create({
      data: {
        orderNumber: await nextOrderNumber(),
        customerId: customer.sub || customer.id,
        type: input.type,
        status: "PENDING",
        scheduledAt,
        autoCancelAt: autoCancelDeadline(scheduledAt, settings),
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        customerNotes: input.customerNotes || null,
        items: { create: lines },
        delivery:
          input.type === "DELIVERY"
            ? {
                create: input.delivery,
              }
            : undefined,
      },
      include: { items: true, delivery: true, customer: true },
    });
    await recordHistory(tx, {
      orderId: created.id,
      actor: customer,
      action: "ORDER_CREATED",
      newValue: { orderNumber: created.orderNumber, type: created.type, total: Number(created.total) },
    });
    return created;
  });

  await notifyStaff({
    type: "NEW_ORDER",
    title: "New order received",
    body: `${order.orderNumber} • ${order.customer.name} • ${order.type.toLowerCase()}`,
    orderId: order.id,
  });
  await notifyUser({
    userId: order.customerId,
    type: "ORDER_CREATED",
    title: "Order placed",
    body: `${order.orderNumber} is in the kitchen queue.`,
    orderId: order.id,
  });
  await prisma.alert.create({
    data: {
      type: "NEW_ORDER",
      message: `New order ${order.orderNumber}`,
      orderId: order.id,
    },
  });
  realtime.broadcast({ type: "order", audience: "staff", orderId: order.id });
  return serializeOrder(order);
}

export async function getOrder(id, actor) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { ...orderIncludes(), history: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) throw new AppError("Order not found.", 404, "NOT_FOUND");
  if (actor.role === "CUSTOMER" && order.customerId !== actor.sub) {
    throw new AppError("You cannot view this order.", 403, "FORBIDDEN");
  }
  return serializeOrder(order);
}

const HISTORY_STATUSES = ["COMPLETED", "CANCELLED"];

export async function listOrders(actor, query = {}) {
  const where = {};
  if (actor.role === "CUSTOMER") where.customerId = actor.sub;
  if (query.scope === "history") {
    where.status = { in: HISTORY_STATUSES };
  } else if (query.scope === "active") {
    where.status = { notIn: HISTORY_STATUSES };
  }
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search, mode: "insensitive" } },
      { customer: { name: { contains: query.search, mode: "insensitive" } } },
      { customer: { email: { contains: query.search, mode: "insensitive" } } },
    ];
  }
  if (query.from || query.to) {
    where.scheduledAt = {};
    if (query.from) where.scheduledAt.gte = new Date(query.from);
    if (query.to) where.scheduledAt.lte = new Date(query.to);
  }
  const isHistory = query.scope === "history";
  const orders = await prisma.order.findMany({
    where,
    include: orderIncludes(),
    orderBy: isHistory ? [{ createdAt: "desc" }] : [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: Number(query.limit) || (isHistory ? 200 : 100),
  });
  return orders.map(serializeOrder);
}

export async function queueOrders() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ACTIVE_QUEUE_STATUSES } },
    include: orderIncludes(),
  });
  const rank = { UNCLAIMED: 0, URGENT: 1, HIGH: 2, NORMAL: 3 };
  return orders
    .map(serializeOrder)
    .sort((a, b) => {
      const pa = rank[a.status === "UNCLAIMED" ? "UNCLAIMED" : a.priority] ?? 3;
      const pb = rank[b.status === "UNCLAIMED" ? "UNCLAIMED" : b.priority] ?? 3;
      if (pa !== pb) return pa - pb;
      const bySchedule = new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      if (bySchedule !== 0) return bySchedule;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

export async function updateStatus(id, status, actor) {
  const current = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!current) throw new AppError("Order not found.", 404, "NOT_FOUND");
  assertTransition(current.status, status, { type: current.type, actorRole: actor.role });

  const updated = await prisma.$transaction(async (tx) => {
    const data = {
      status,
      priority: computePriority({ ...current, status }),
      autoCancelAt: status === "CONFIRMED" ? null : undefined,
      readyAt: status === "READY" && !current.readyAt ? new Date() : undefined,
    };
    const next = await tx.order.update({ where: { id }, data, include: { items: true, delivery: true, customer: true } });
    await recordHistory(tx, {
      orderId: id,
      actor,
      action: "STATUS_CHANGED",
      previousValue: { status: current.status },
      newValue: { status },
    });
    return next;
  });

  const labels = {
    CONFIRMED: "confirmed",
    PREPARING: "being prepared",
    READY: current.type === "PICKUP" ? "ready for pickup" : "ready for dispatch",
    OUT_FOR_DELIVERY: "out for delivery",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    UNCLAIMED: "marked unclaimed",
  };
  if (status === "COMPLETED") {
    await notifyUser({
      userId: current.customerId,
      type: "ORDER_COMPLETED",
      title: `Order ${current.orderNumber} is Done! 🎉`,
      body: current.type === "DELIVERY"
        ? `Your order ${current.orderNumber} has been safely delivered to your doorstep in Tupi! Salamat sa pag-order sa Boytag's Lechon Manok!`
        : `Your order ${current.orderNumber} has been picked up and completed at our Poblacion HQ! Salamat sa pag-order sa Boytag's!`,
      orderId: id,
    });
  } else {
    await notifyUser({
      userId: current.customerId,
      type: "STATUS",
      title: `Order ${current.orderNumber}`,
      body: `Your order is now ${labels[status] || status.toLowerCase()}.`,
      orderId: id,
    });
  }
  realtime.broadcast({
    type: status === "COMPLETED" ? "order-completed" : "order",
    audience: "all",
    orderId: id,
    userId: current.customerId,
    orderNumber: current.orderNumber,
    status,
  });
  return serializeOrder(updated);
}

export async function completeByCustomer(id, actor) {
  const current = await prisma.order.findUnique({
    where: { id },
    include: { items: true, delivery: true, customer: true },
  });
  if (!current) throw new AppError("Order not found.", 404, "NOT_FOUND");
  if (actor.role === "CUSTOMER" && current.customerId !== (actor.sub || actor.id)) {
    throw new AppError("You cannot confirm this order.", 403, "FORBIDDEN");
  }
  if (!["READY", "OUT_FOR_DELIVERY"].includes(current.status)) {
    throw new AppError("Order cannot be marked complete at its current stage.", 400, "INVALID_TRANSITION");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const data = { status: "COMPLETED", priority: "NORMAL" };
    const next = await tx.order.update({
      where: { id },
      data,
      include: { items: true, delivery: true, customer: true },
    });
    await recordHistory(tx, {
      orderId: id,
      actor,
      action: "DELIVERY_CONFIRMED",
      previousValue: { status: current.status },
      newValue: { status: "COMPLETED", confirmedBy: actor.name || "Customer" },
    });
    return next;
  });

  await notifyStaff({
    type: "ORDER_COMPLETED",
    title: `Order ${current.orderNumber} Confirmed Received`,
    body: `${current.customer.name} confirmed receipt of their order!`,
    orderId: id,
  });

  await notifyUser({
    userId: current.customerId,
    type: "ORDER_COMPLETED",
    title: `Order ${current.orderNumber} is Done! 🎉`,
    body: current.type === "DELIVERY"
      ? `Your order ${current.orderNumber} has been safely received and completed! Salamat sa pag-order sa Boytag's!`
      : `Your order ${current.orderNumber} has been picked up and completed! Enjoy your feast!`,
    orderId: id,
  });

  realtime.broadcast({
    type: "order-completed",
    audience: "all",
    orderId: id,
    userId: current.customerId,
    orderNumber: current.orderNumber,
    status: "COMPLETED",
  });

  return serializeOrder(updated);
}

export async function notifyRiderArrived(id, actor) {
  const current = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, delivery: true },
  });
  if (!current) throw new AppError("Order not found.", 404, "NOT_FOUND");

  await recordHistory(prisma, {
    orderId: id,
    actor,
    action: "RIDER_ARRIVED",
    previousValue: null,
    newValue: { address: current.delivery?.address || null },
  });

  await notifyUser({
    userId: current.customerId,
    type: "RIDER_ARRIVED",
    title: "Kuya Jun (Rider) is Outside Your House! 🛵🔔",
    body: `Your Boytag's rider has arrived at ${current.delivery?.address || 'your gate'} with your hot roast feast. Please meet the rider!`,
    orderId: id,
  });

  realtime.broadcast({
    type: "rider-arrived",
    audience: "all",
    orderId: id,
    userId: current.customerId,
    orderNumber: current.orderNumber,
  });

  return serializeOrder(current);
}

export async function cancelOrder(id, actor, reason) {
  const current = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!current) throw new AppError("Order not found.", 404, "NOT_FOUND");
  if (actor.role === "CUSTOMER") {
    if (current.customerId !== actor.sub) throw new AppError("You cannot cancel this order.", 403, "FORBIDDEN");
    if (!customerCanCancel(current.status)) {
      throw new AppError("This order can no longer be cancelled. Please contact the store.", 409, "CANNOT_CANCEL");
    }
  }
  assertTransition(current.status, "CANCELLED", { type: current.type, actorRole: actor.role === "CUSTOMER" ? "STAFF" : actor.role });

  const updated = await prisma.$transaction(async (tx) => {
    await applyInventory(tx, current.items, "increment");
    const next = await tx.order.update({
      where: { id },
      data: { status: "CANCELLED", cancelReason: reason || null },
      include: { items: true, delivery: true, customer: true },
    });
    await recordHistory(tx, {
      orderId: id,
      actor,
      action: "ORDER_CANCELLED",
      previousValue: { status: current.status },
      newValue: { status: "CANCELLED", reason: reason || null },
    });
    return next;
  });
  await notifyUser({
    userId: current.customerId,
    type: "CANCELLED",
    title: `Order cancelled`,
    body: `${updated.orderNumber} was cancelled.`,
    orderId: id,
  });
  await notifyStaff({
    type: "CANCELLED",
    title: "Order cancelled",
    body: `${updated.orderNumber} was cancelled.`,
    orderId: id,
  });
  realtime.broadcast({ type: "order", audience: "all", orderId: id, userId: current.customerId });
  realtime.broadcast({ type: "inventory", audience: "all" });
  return serializeOrder(updated);
}

export async function updateOrder(id, actor, input) {
  const current = await prisma.order.findUnique({
    where: { id },
    include: { items: true, delivery: true, customer: true },
  });
  if (!current) throw new AppError("Order not found.", 404, "NOT_FOUND");
  if (actor.role === "CUSTOMER") {
    if (current.customerId !== actor.sub) throw new AppError("You cannot edit this order.", 403, "FORBIDDEN");
    if (!customerCanEdit(current.status)) {
      throw new AppError("This order can no longer be edited.", 409, "CANNOT_EDIT");
    }
  }

  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const updated = await prisma.$transaction(async (tx) => {
    const changes = [];
    let lines = current.items;
    if (input.items) {
      await applyInventory(tx, current.items, "increment");
      lines = await hydrateItems(tx, input.items);
      await applyInventory(tx, lines, "decrement");
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.orderItem.createMany({ data: lines.map((line) => ({ ...line, orderId: id })) });
      changes.push({ field: "items" });
      await recordHistory(tx, {
        orderId: id,
        actor,
        action: "ITEMS_CHANGED",
        previousValue: current.items.map((i) => ({ name: i.productName, qty: i.quantity })),
        newValue: lines.map((i) => ({ name: i.productName, qty: i.quantity })),
      });
    }
    if (input.scheduledAt) {
      await recordHistory(tx, {
        orderId: id,
        actor,
        action: "SCHEDULE_CHANGED",
        previousValue: { scheduledAt: current.scheduledAt },
        newValue: { scheduledAt: input.scheduledAt },
      });
    }
    if (input.delivery && current.type === "DELIVERY") {
      await tx.deliveryDetail.update({
        where: { orderId: id },
        data: input.delivery,
      });
      await recordHistory(tx, {
        orderId: id,
        actor,
        action: "DELIVERY_UPDATED",
        previousValue: deliverySnapshot(current.delivery),
        newValue: deliverySnapshot({ ...current.delivery, ...input.delivery }),
      });
    }
    if (input.customerNotes !== undefined) {
      await recordHistory(tx, {
        orderId: id,
        actor,
        action: "NOTES_CHANGED",
        previousValue: { customerNotes: current.customerNotes },
        newValue: { customerNotes: input.customerNotes },
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
    const type = input.type || current.type;
    const deliveryFee = type === "DELIVERY" ? Number(settings?.deliveryFee || 0) : 0;
    const next = await tx.order.update({
      where: { id },
      data: {
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        autoCancelAt:
          input.scheduledAt && current.status === "PENDING"
            ? autoCancelDeadline(input.scheduledAt, settings)
            : undefined,
        customerNotes: input.customerNotes === undefined ? undefined : input.customerNotes,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
      },
      include: { items: true, delivery: true, customer: true },
    });
    return next;
  });

  realtime.broadcast({ type: "order", audience: "all", orderId: id, userId: current.customerId });
  return serializeOrder(updated);
}

export async function listHistory(id, actor) {
  await getOrder(id, actor);
  return prisma.orderHistory.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "asc" },
  });
}

/** Staff-wide audit trail: the most recent changes across every order. */
export async function recentHistory(limit = 60) {
  const rows = await prisma.orderHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(Number(limit) || 60, 1), 200),
    include: {
      order: { select: { id: true, orderNumber: true, status: true, scheduledAt: true, type: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    orderId: row.orderId,
    action: row.action,
    actorName: row.actorName,
    actorRole: row.actorRole,
    previousValue: row.previousValue ?? null,
    newValue: row.newValue ?? null,
    createdAt: row.createdAt,
    order: row.order,
  }));
}
