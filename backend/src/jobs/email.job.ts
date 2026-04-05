import { Worker } from "bullmq";
import { redisForBullMQ } from "../config/redis";
import { prisma } from "../config/database";
import { notificationsService } from "../modules/notifications/notifications.service";
import { logger } from "../utils/logger";
import { EmailJobData } from "../config/bullmq";

export const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job) => {
    const data = job.data;
    logger.info({ jobId: job.id, type: data.type }, "Processing email job");

    if (data.type === "welcome") {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (!user) return;
      await notificationsService.sendWelcome({
        to: user.email,
        username: user.username,
      });
    }

    if (data.type === "booking_confirmed" || data.type === "payment_success") {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          user: { select: { email: true, username: true } },
          event: { select: { title: true, dateStart: true, venue: true } },
          items: {
            include: {
              ticketCategory: { select: { name: true, price: true } },
            },
          },
        },
      });
      if (!booking) return;

      await notificationsService.sendBookingConfirmation({
        to: booking.user.email,
        username: booking.user.username,
        bookingRef: booking.bookingRef,
        eventTitle: booking.event.title,
        eventDate: booking.event.dateStart,
        venue: booking.event.venue,
        totalAmount: Number(booking.totalAmount),
        items: booking.items.map((i) => ({
          category: i.ticketCategory.name,
          quantity: i.quantity,
          unitPrice: Number(i.ticketCategory.price),
        })),
      });
    }

    if (data.type === "booking_cancelled") {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          user: { select: { email: true, username: true } },
          event: { select: { title: true } },
        },
      });
      if (!booking) return;

      await notificationsService.sendBookingCancellation({
        to: booking.user.email,
        username: booking.user.username,
        bookingRef: booking.bookingRef,
        eventTitle: booking.event.title,
        reason: booking.cancelReason ?? undefined,
      });
    }
  },
  {
    connection: redisForBullMQ as any,
    skipVersionCheck: true,
    concurrency: 5,
  },
);

emailWorker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Email job completed");
});
emailWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Email job failed");
});
