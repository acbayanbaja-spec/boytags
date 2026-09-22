import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { corsOrigins, env } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { message: "Too many requests. Please wait a moment." } },
    }),
  );
  app.use(
    "/api/auth/login",
    rateLimit({
      windowMs: 15 * 60_000,
      limit: 20,
      message: { success: false, error: { message: "Too many sign-in attempts. Try again shortly." } },
    }),
  );
  app.get("/health", (_req, res) => res.json({ ok: true, service: "boytags-api" }));
  app.use("/api", router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
