import { prisma } from "../config/db.js";
import { realtime } from "../realtime/hub.js";

export async function notifyUser({ userId, type, title, body, orderId }) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, orderId: orderId || null },
  });
  realtime.broadcast({
    type: "notification",
    audience: "user",
    userId,
    notification,
  });
  return notification;
}

export async function notifyStaff({ type, title, body, orderId }) {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: { id: true },
  });
  const created = [];
  for (const member of staff) {
    created.push(await notifyUser({ userId: member.id, type, title, body, orderId }));
  }
  realtime.broadcast({ type: "staff-event", audience: "staff", eventType: type, orderId, title, body });
  return created;
}

export async function listNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function unreadCount(userId) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markRead(userId, id) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
