import { prisma } from "../config/db.js";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function dashboardStats() {
  const today = startOfDay();
  const [
    ordersToday,
    pending,
    preparing,
    ready,
    out,
    completed,
    unclaimed,
    soldOut,
    recentOrders,
    recentHistory,
    openAlerts,
    upcoming,
    series,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today }, status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.order.count({ where: { status: "READY" } }),
    prisma.order.count({ where: { status: "OUT_FOR_DELIVERY" } }),
    prisma.order.count({ where: { status: "COMPLETED", updatedAt: { gte: today } } }),
    prisma.order.count({ where: { status: "UNCLAIMED" } }),
    prisma.product.count({ where: { OR: [{ soldOut: true }, { availableQty: 0 }], active: true } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } }, items: true },
    }),
    prisma.orderHistory.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true } } },
    }),
    prisma.alert.findMany({
      where: { status: "OPEN" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true } } },
    }),
    prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      include: { customer: { select: { name: true } }, items: true },
    }),
    lastSevenDays(),
  ]);

  return {
    metrics: {
      ordersToday,
      pending,
      preparing,
      ready,
      outForDelivery: out,
      completed,
      unclaimed,
      soldOut,
    },
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: Number(order.total),
    })),
    recentHistory,
    openAlerts,
    upcoming: upcoming.map((order) => ({ ...order, total: Number(order.total) })),
    series,
  };
}

async function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const from = startOfDay(new Date(Date.now() - i * 86400000));
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    const [count, completed] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: from, lt: to } } }),
      prisma.order.count({ where: { status: "COMPLETED", updatedAt: { gte: from, lt: to } } }),
    ]);
    days.push({
      date: from.toISOString().slice(0, 10),
      label: from.toLocaleDateString("en-PH", { weekday: "short" }),
      orders: count,
      completed,
    });
  }
  return days;
}

export async function getSettings() {
  return prisma.setting.findUnique({ where: { id: "default" } });
}
