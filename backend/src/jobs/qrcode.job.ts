import { Worker } from "bullmq";
import { redisForBullMQ } from "../config/redis";
import { ticketsService } from "../modules/tickets/tickets.service";
import { logger } from "../utils/logger";
import { QrCodeJobData } from "../config/bullmq";

export const qrCodeWorker = new Worker<QrCodeJobData>(
  "qrcode",
  async (job) => {
    const { bookingId } = job.data;
    logger.info({ jobId: job.id, bookingId }, "Generating QR codes");
    await ticketsService.generateTicketsForBooking(bookingId);
    logger.info({ bookingId }, "QR codes generated");
  },
  {
    connection: redisForBullMQ as any,
    skipVersionCheck: true,
    concurrency: 3,
  },
);

qrCodeWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "QR code job completed");
});
qrCodeWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "QR code job failed");
});
