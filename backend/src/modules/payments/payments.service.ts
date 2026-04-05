import { prisma } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { razorpayService } from "./razorpay.service";
import { emailQueue } from "../../config/bullmq";

export const paymentsService = {
  async createOrder(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: { select: { title: true } } },
    });

    if (!booking) throw AppError.notFound("Booking");
    if (booking.userId !== userId) throw AppError.forbidden();
    if (booking.paymentStatus === "PAID")
      throw AppError.conflict("Booking already paid");
    if (booking.status === "CANCELLED")
      throw AppError.badRequest("Booking is cancelled");

    const amount = Number(booking.totalAmount);

    // Free events
    if (amount === 0) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED", paymentStatus: "PAID" },
      });
      await prisma.payment.create({
        data: {
          bookingId,
          provider: "FREE",
          amount: 0,
          status: "PAID",
        },
      });
      await emailQueue.add("booking_confirmed", {
        type: "payment_success",
        bookingId,
      });
      return { free: true };
    }

    const order = await razorpayService.createOrder(
      amount,
      "INR",
      booking.bookingRef,
    );
    await prisma.payment.create({
      data: {
        bookingId,
        provider: "RAZORPAY",
        providerOrderId: order.id,
        amount,
        status: "PENDING",
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  },

  async verifyAndConfirm(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    bookingId: string;
    userId: string;
  }) {
    const valid = razorpayService.verifySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature,
    );

    if (!valid)
      throw AppError.badRequest(
        "Payment verification failed",
        "INVALID_SIGNATURE",
      );

    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    });
    if (!booking) throw AppError.notFound("Booking");
    if (booking.userId !== data.userId) throw AppError.forbidden();

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: {
          bookingId: data.bookingId,
          providerOrderId: data.razorpayOrderId,
        },
        data: {
          providerPayId: data.razorpayPaymentId,
          status: "PAID",
        },
      }),
      prisma.booking.update({
        where: { id: data.bookingId },
        data: { status: "CONFIRMED", paymentStatus: "PAID" },
      }),
    ]);

    await emailQueue.add("payment_success", {
      type: "payment_success",
      bookingId: data.bookingId,
    });

    return { verified: true };
  },

  async handleWebhook(rawBody: string, signature: string) {
    const valid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!valid) throw AppError.unauthorized("Invalid webhook signature");

    const event = JSON.parse(rawBody);
    const { event: eventType, payload } = event;

    if (eventType === "payment.captured") {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.order_id;

      const payment = await prisma.payment.findFirst({
        where: { providerOrderId: orderId },
      });

      if (payment && payment.status !== "PAID") {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              providerPayId: paymentId,
              status: "PAID",
              rawResponse: payload,
            },
          }),
          prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "CONFIRMED", paymentStatus: "PAID" },
          }),
        ]);
      }
    } else if (eventType === "payment.failed") {
      const orderId = payload.payment.entity.order_id;
      await prisma.payment.updateMany({
        where: { providerOrderId: orderId },
        data: { status: "FAILED" },
      });
    }
  },
};
