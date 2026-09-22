import { AppError } from "./http.js";

const TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "COMPLETED", "UNCLAIMED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "UNCLAIMED"],
  UNCLAIMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertTransition(from, to, { type, actorRole } = {}) {
  const allowed = TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new AppError(`Cannot move an order from ${from} to ${to}.`, 409, "INVALID_STATUS");
  }
  if (to === "OUT_FOR_DELIVERY" && type === "PICKUP") {
    throw new AppError("Pickup orders cannot go out for delivery.", 409, "INVALID_STATUS");
  }
  if (to === "COMPLETED" && from === "READY" && type === "DELIVERY") {
    throw new AppError("Delivery orders must be marked out for delivery before completion.", 409, "INVALID_STATUS");
  }
  if (["CUSTOMER"].includes(actorRole) && !["CANCELLED"].includes(to)) {
    throw new AppError("Customers cannot change operational order status.", 403, "FORBIDDEN");
  }
}

export function customerCanEdit(status) {
  return ["PENDING", "CONFIRMED"].includes(status);
}

export function customerCanCancel(status) {
  return ["PENDING", "CONFIRMED", "PREPARING"].includes(status);
}

export const ACTIVE_QUEUE_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "UNCLAIMED",
];
