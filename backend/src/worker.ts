// Worker process entrypoint — run separately: npm run worker
import "./jobs/email.job";
import "./jobs/qrcode.job";
import { logger } from "./utils/logger";

logger.info("🚀 Worker process started");
logger.info("Processing queues: email, qrcode");

process.on("SIGTERM", () => {
  logger.info("Worker SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Worker SIGINT received, shutting down gracefully");
  process.exit(0);
});
