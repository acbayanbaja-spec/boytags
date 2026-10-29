import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import { logger } from "../utils/logger.js";

export function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.path} was not found.`, 404, "NOT_FOUND"));
}

/**
 * Prisma reports database failures as bare 500s, which the production mask used to flatten into
 * "Something went wrong". Each code maps to a message that names the real cause in customer terms,
 * carrying no stored values, credentials or connection strings.
 */
const PRISMA_ERRORS = {
  P1001: [503, "The kitchen database is not reachable right now. Please try again in a moment."],
  P1002: [503, "The kitchen database is still starting up. Please try again in a moment."],
  P1003: [503, "The kitchen database has no free connections. Please try again in a moment."],
  P1008: [503, "The kitchen database timed out. Please try again."],
  P1017: [503, "The kitchen database connection dropped. Please try again."],
  P2000: [422, "One of the values you entered is longer than our records allow."],
  P2002: [409, "That entry already exists. Please try again."],
  P2003: [500, "This order points at a dish or account that no longer exists. Refresh the menu, then try again."],
  P2011: [422, "A required detail is missing from this order. Please complete the form and try again."],
  P2012: [422, "A required detail is missing from this order. Please complete the form and try again."],
  P2019: [500, "A saved value no longer matches the menu setup. Please refresh the menu and try again."],
  P2020: [500, "A value in this order is out of range. Please check the amounts and try again."],
  P2022: [500, "The menu is out of step with the kitchen database. It resyncs on the next deploy."],
  P2024: [503, "The kitchen server is at capacity. Please try again in a moment."],
  P2025: [404, "The requested record was not found."],
  P2028: [503, "The kitchen server could not finish saving this order. Please try again in a moment."],
  P2034: [409, "Someone changed this record at the same moment. Please try again."],
};

function prismaFault(err) {
  if (!/^PrismaClient/.test(String(err?.name || ""))) return null;
  const known = PRISMA_ERRORS[err.code];
  if (known) return { status: known[0], code: err.code, message: known[1] };
  // Unmapped database errors keep their code (never their message) so the pair is searchable
  // in the server logs while the customer still gets the generic wording.
  return { status: err.statusCode || 500, code: err.code || "PRISMA", message: null };
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again.";
  let code = err.code || "INTERNAL";
  let specific = err instanceof AppError;

  if (err instanceof ZodError) {
    status = 422;
    code = "VALIDATION";
    message = err.issues[0]?.message || "Please check the form and try again.";
    specific = true;
  } else {
    const fault = prismaFault(err);
    if (fault) {
      status = fault.status;
      code = fault.code;
      specific = Boolean(fault.message);
      if (fault.message) message = fault.message;
    }
  }

  let requestId = null;
  if (status >= 500) {
    requestId = randomUUID().slice(0, 8);
    logger.error("Unhandled error", {
      requestId,
      code,
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
    });
    if (!specific && env.NODE_ENV === "production") {
      message = "Something went wrong. Please try again.";
    }
  }

  const error = { code, message };
  if (requestId) error.requestId = requestId;
  res.status(status).json({ success: false, error });
}
