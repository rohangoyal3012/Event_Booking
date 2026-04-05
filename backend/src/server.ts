import http from "http";
import { createApp } from "./app";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { redis } from "./config/redis";
import { createSocketServer } from "./websockets/socket.server";
import { setupMeilisearch } from "./config/meilisearch";
import { logger } from "./utils/logger";

async function bootstrap() {
  // Connect to database
  await connectDatabase();

  // Setup Meilisearch indexes
  await setupMeilisearch();

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = http.createServer(app);

  // Attach Socket.io
  createSocketServer(server);

  // Start listening
  server.listen(config.PORT, () => {
    logger.info(
      `🚀 Server running on port ${config.PORT} [${config.NODE_ENV}]`,
    );
    logger.info(
      `📡 API: http://localhost:${config.PORT}/api/${config.API_VERSION}`,
    );
  });

  // ─── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase();
      await redis.quit();
      logger.info("Server shutdown complete");
      process.exit(0);
    });

    // Force exit after 30s
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled Promise Rejection");
  });

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught Exception");
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, "Fatal: Failed to start server");
  process.exit(1);
});
