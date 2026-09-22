import { Router } from "express";
import { authenticate, optionalAuth, requireRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as auth from "../controllers/authController.js";
import * as products from "../controllers/productController.js";
import * as orders from "../controllers/orderController.js";
import * as ops from "../controllers/opsController.js";
import {
  forgotSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetSchema,
} from "../validators/authValidators.js";
import { idParamSchema, productCreateSchema, productUpdateSchema } from "../validators/productValidators.js";
import { cancelSchema, createOrderSchema, statusSchema, updateOrderSchema } from "../validators/orderValidators.js";
import { realtime } from "../realtime/hub.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const router = Router();

router.post("/auth/register", validate(registerSchema), auth.register);
router.post("/auth/login", validate(loginSchema), auth.login);
router.post("/auth/refresh", auth.refresh);
router.post("/auth/forgot-password", validate(forgotSchema), auth.forgot);
router.post("/auth/reset-password", validate(resetSchema), auth.reset);
router.get("/auth/me", authenticate, auth.me);
router.patch("/auth/me", authenticate, validate(profileSchema), auth.updateMe);

router.get("/categories", products.categories);
router.get("/products", optionalAuth, products.list);
router.get("/products/:id", products.get);
router.post("/products", authenticate, requireRoles("STAFF", "ADMIN"), validate(productCreateSchema), products.create);
router.patch("/products/:id", authenticate, requireRoles("STAFF", "ADMIN"), validate(productUpdateSchema), products.update);
router.delete("/products/:id", authenticate, requireRoles("STAFF", "ADMIN"), validate(idParamSchema), products.remove);

router.post("/orders", authenticate, validate(createOrderSchema), orders.create);
router.get("/orders", authenticate, orders.list);
router.get("/orders/queue", authenticate, requireRoles("STAFF", "ADMIN"), orders.queue);
router.get("/orders/:id", authenticate, orders.get);
router.patch("/orders/:id", authenticate, validate(updateOrderSchema), orders.update);
router.patch("/orders/:id/status", authenticate, requireRoles("STAFF", "ADMIN"), validate(statusSchema), orders.status);
router.post("/orders/:id/cancel", authenticate, validate(cancelSchema), orders.cancel);
router.get("/orders/:id/history", authenticate, orders.history);

router.get("/dashboard/stats", authenticate, requireRoles("STAFF", "ADMIN"), ops.stats);
router.get("/settings", ops.settings);
router.get("/alerts", authenticate, requireRoles("STAFF", "ADMIN"), ops.alerts);
router.post("/alerts/:id/ack", authenticate, requireRoles("STAFF", "ADMIN"), ops.ackAlert);
router.post("/alerts/:id/resolve", authenticate, requireRoles("STAFF", "ADMIN"), ops.resolveAlert);

router.get("/notifications", authenticate, ops.notifications);
router.post("/notifications/read-all", authenticate, ops.readAllNotifications);
router.post("/notifications/:id/read", authenticate, ops.readNotification);

router.get("/events", (req, res) => {
  const token = String(req.query.token || "").replace("Bearer ", "");
  let user;
  try {
    user = verifyAccessToken(token);
  } catch {
    res.status(401).json({ success: false, error: { message: "Please sign in to continue." } });
    return;
  }
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  realtime.addClient(res, user);
});
