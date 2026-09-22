import { asyncHandler, ok } from "../utils/http.js";
import * as alertService from "../services/alertService.js";
import * as dashboardService from "../services/dashboardService.js";
import * as notificationService from "../services/notificationService.js";

export const alerts = asyncHandler(async (req, res) => {
  ok(res, await alertService.listAlerts(req.query.status));
});

export const ackAlert = asyncHandler(async (req, res) => {
  ok(res, await alertService.acknowledgeAlert(req.params.id, req.user));
});

export const resolveAlert = asyncHandler(async (req, res) => {
  ok(res, await alertService.resolveAlert(req.params.id, req.user));
});

export const stats = asyncHandler(async (req, res) => {
  ok(res, await dashboardService.dashboardStats());
});

export const settings = asyncHandler(async (req, res) => {
  ok(res, await dashboardService.getSettings());
});

export const notifications = asyncHandler(async (req, res) => {
  const [items, unread] = await Promise.all([
    notificationService.listNotifications(req.user.sub),
    notificationService.unreadCount(req.user.sub),
  ]);
  ok(res, { items, unread });
});

export const readNotification = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.user.sub, req.params.id);
  ok(res, { read: true });
});

export const readAllNotifications = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.sub);
  ok(res, { read: true });
});
