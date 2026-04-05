import { Queue } from "bullmq";
import { redisForBullMQ } from "./redis";

// BullMQ bundles its own ioredis; cast to any to avoid type mismatch
const connection = redisForBullMQ as any;

export const emailQueue = new Queue("email", {
  connection,
  skipVersionCheck: true,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const qrCodeQueue = new Queue("qrcode", {
  connection,
  skipVersionCheck: true,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const paymentQueue = new Queue("payment", {
  connection,
  skipVersionCheck: true,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
  },
});

export const notificationQueue = new Queue("notification", {
  connection,
  skipVersionCheck: true,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 1000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  },
});

// ─── Job types ────────────────────────────────────────────────────────────────

export type EmailJobData =
  | { type: "booking_confirmed"; bookingId: string }
  | { type: "booking_cancelled"; bookingId: string }
  | { type: "welcome"; userId: string }
  | { type: "event_reminder"; eventId: string }
  | { type: "event_cancelled"; eventId: string }
  | { type: "payment_success"; bookingId: string }
  | { type: "payment_failed"; bookingId: string };

export type QrCodeJobData = { bookingId: string };
export type PaymentJobData = { bookingId: string; orderId: string };
export type NotificationJobData = {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};
