import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import { logger } from "../utils/logger.js";

export function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.path} was not found.`, 404, "NOT_FOUND"));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again.";
  let code = err.code || "INTERNAL";

  if (err instanceof ZodError) {
    status = 422;
    code = "VALIDATION";
    message = err.issues[0]?.message || "Please check the form and try again.";
  }

  if (err.code === "P2002") {
    status = 409;
    code = "CONFLICT";
    message = "That record already exists.";
  }
  if (err.code === "P2025") {
    status = 404;
    code = "NOT_FOUND";
    message = "The requested record was not found.";
  }

  if (!(err instanceof AppError) && status >= 500) {
    logger.error("Unhandled error", {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });
    if (env.NODE_ENV === "production") {
      message = "Something went wrong. Please try again.";
    }
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
