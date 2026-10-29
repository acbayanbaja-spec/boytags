import { asyncHandler, created, ok, AppError } from "../utils/http.js";
import * as orderService from "../services/orderService.js";

export const create = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("You must be logged in to place an order. Please sign in.", 401, "UNAUTHORIZED");
  }
  const data = await orderService.createOrder(req.user, req.body);
  created(res, data);
});

export const list = asyncHandler(async (req, res) => {
  const data = await orderService.listOrders(req.user, req.query);
  ok(res, data);
});

export const queue = asyncHandler(async (req, res) => {
  const data = await orderService.queueOrders();
  ok(res, data);
});

export const get = asyncHandler(async (req, res) => {
  const data = await orderService.getOrder(req.params.id, req.user);
  ok(res, data);
});

export const update = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrder(req.params.id, req.user, req.body);
  ok(res, data);
});

export const status = asyncHandler(async (req, res) => {
  const data = await orderService.updateStatus(req.params.id, req.body.status, req.user);
  ok(res, data);
});

export const completeByCustomer = asyncHandler(async (req, res) => {
  const data = await orderService.completeByCustomer(req.params.id, req.user);
  ok(res, data);
});

export const riderArrived = asyncHandler(async (req, res) => {
  const data = await orderService.notifyRiderArrived(req.params.id, req.user);
  ok(res, data);
});

export const cancel = asyncHandler(async (req, res) => {
  const data = await orderService.cancelOrder(req.params.id, req.user, req.body.reason);
  ok(res, data);
});

export const history = asyncHandler(async (req, res) => {
  const data = await orderService.listHistory(req.params.id, req.user);
  ok(res, data);
});

export const auditLog = asyncHandler(async (req, res) => {
  const data = await orderService.recentHistory(req.query.limit);
  ok(res, data);
});
