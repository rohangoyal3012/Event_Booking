import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import eventsRoutes from "./modules/events/events.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import ticketsRoutes from "./modules/tickets/tickets.routes";
import searchRoutes from "./modules/search/search.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";

export function createApp(): Application {
  const app = express();

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN.split(","),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(hpp());

  // ─── Body parsing ─────────────────────────────────────────────────────────
  // Preserve raw body for webhook signature verification
  app.use(
    express.json({
      verify: (req: Request & { rawBody?: string }, _res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ─── Logging ──────────────────────────────────────────────────────────────
  app.use(requestLogger);

  // ─── Rate limiting ────────────────────────────────────────────────────────
  app.use(`/api/${config.API_VERSION}`, apiRateLimiter);

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────
  const apiRouter = express.Router();

  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/users", usersRoutes);
  apiRouter.use("/events", eventsRoutes);
  apiRouter.use("/bookings", bookingsRoutes);
  apiRouter.use("/payments", paymentsRoutes);
  apiRouter.use("/tickets", ticketsRoutes);
  apiRouter.use("/search", searchRoutes);
  apiRouter.use("/analytics", analyticsRoutes);
  apiRouter.use("/reviews", reviewsRoutes);

  app.use(`/api/${config.API_VERSION}`, apiRouter);

  // ─── 404 handler ──────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // ─── Error handler ────────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
