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

async function applyInventory(tx, items, direction) {
  const settings = await tx.setting.findUnique({ where: { id: "default" } });
  for (const item of items) {
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
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        throw new AppError(
          product
            ? `${product.name} does not have enough stock for this order.`
            : "One of the products is no longer available.",
          409,
          "INVENTORY",
        );
      }
    } else {
      await tx.product.update({
        where: { id: item.productId },
        data: { availableQty: { increment: item.quantity } },
      });
    }

    const product = await tx.product.findUnique({ where: { id: item.productId } });
    const soldOut = product.availableQty <= 0;
    await tx.product.update({
      where: { id: product.id },
      data: { soldOut, availableQty: Math.max(0, product.availableQty) },
    });

    if (soldOut && direction === "decrement") {
      const existing = await tx.alert.findFirst({
        where: { productId: product.id, type: "SOLD_OUT", status: "OPEN" },
      });
      if (!existing) {
        await tx.alert.create({
          data: {
            type: "SOLD_OUT",
            message: `${product.name} is sold out.`,
            productId: product.id,
          },
        });
      }
    } else if (!soldOut && settings && product.availableQty <= settings.lowStockThreshold && direction === "decrement") {
      await tx.alert.create({
        data: {
          type: "LOW_STOCK",
          message: `${product.name} is low on stock (${product.availableQty} left).`,
          productId: product.id,
        },
      });
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

export async function createOrder(customer, input) {
  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < new Date(Date.now() - 60000)) {
    throw new AppError("Choose a valid future pickup or delivery time.", 422, "INVALID_SCHEDULE");
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
    include: {
      items: { include: { product: true } },
      delivery: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
      history: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) throw new AppError("Order not found.", 404, "NOT_FOUND");
  if (actor.role === "CUSTOMER" && order.customerId !== actor.sub) {
    throw new AppError("You cannot view this order.", 403, "FORBIDDEN");
  }
  return serializeOrder(order);
}

export async function listOrders(actor, query = {}) {
  const where = {};
  if (actor.role === "CUSTOMER") where.customerId = actor.sub;
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
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      delivery: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: Number(query.limit) || 100,
  });
  return orders.map(serializeOrder);
}

export async function queueOrders() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ACTIVE_QUEUE_STATUSES } },
    include: {
      items: true,
      delivery: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  const now = Date.now();
  return orders
    .map(serializeOrder)
    .sort((a, b) => {
      const rank = { UNCLAIMED: 0, URGENT: 1, HIGH: 2, NORMAL: 3 };
      const pa = rank[a.status === "UNCLAIMED" ? "UNCLAIMED" : a.priority];
      const pb = rank[b.status === "UNCLAIMED" ? "UNCLAIMED" : b.priority];
      if (pa !== pb) return pa - pb;
      return new Date(a.scheduledAt) - new Date(b.scheduledAt) || now;
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
    const data = { status, priority: computePriority({ ...current, status }) };
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
  await notifyUser({
    userId: current.customerId,
    type: "STATUS",
    title: `Order ${current.orderNumber}`,
    body: `Your order is now ${labels[status] || status.toLowerCase()}.`,
    orderId: id,
  });
  realtime.broadcast({ type: "order", audience: "all", orderId: id, userId: current.customerId });
  return serializeOrder(updated);
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
        previousValue: current.delivery,
        newValue: input.delivery,
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
