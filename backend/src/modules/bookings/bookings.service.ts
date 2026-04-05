import { prisma } from "../../config/database";
import { acquireLock, releaseLock } from "../../config/redis";
import { AppError } from "../../utils/AppError";
import { generateBookingRef } from "../../utils/bookingRef";
import { getPaginationParams, paginatedResponse } from "../../utils/pagination";
import { emailQueue, qrCodeQueue } from "../../config/bullmq";
import { CreateBookingDto } from "./bookings.validator";
import { Prisma } from "@prisma/client";

export const bookingsService = {
  async createBooking(userId: string, dto: CreateBookingDto) {
    const event = await prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { ticketCategories: true },
    });

    if (!event) throw AppError.notFound("Event");
    if (event.status !== "PUBLISHED")
      throw AppError.badRequest("Event is not available for booking");
    if (event.dateStart < new Date())
      throw AppError.badRequest("Event has already started");
    if (event.availableSeats <= 0) throw AppError.conflict("Event is sold out");

    // Validate categories and quantities
    const categoryMap = new Map(
      event.ticketCategories.map((tc) => [tc.id, tc]),
    );
    for (const item of dto.items) {
      const cat = categoryMap.get(item.ticketCategoryId);
      if (!cat) throw AppError.notFound("Ticket category");
      if (!cat.isActive)
        throw AppError.badRequest(
          `Ticket category "${cat.name}" is not active`,
        );
      if (item.quantity > cat.maxPerBooking)
        throw AppError.badRequest(
          `Max ${cat.maxPerBooking} tickets per booking for "${cat.name}"`,
        );
      if (item.quantity > cat.availableQuantity)
        throw AppError.badRequest(
          `Only ${cat.availableQuantity} tickets left for "${cat.name}"`,
        );
    }

    const lockKey = `booking:lock:${dto.eventId}`;
    const acquired = await acquireLock(lockKey, 10000);
    if (!acquired)
      throw AppError.tooManyRequests("Please retry your booking in a moment");

    try {
      const booking = await prisma.$transaction(async (tx) => {
        // Re-check availability under lock
        const freshEvent = await tx.event.findUnique({
          where: { id: dto.eventId },
          include: { ticketCategories: true },
        });

        let totalAmount = new Prisma.Decimal(0);
        const bookingItems: {
          ticketCategoryId: string;
          quantity: number;
          unitPrice: Prisma.Decimal;
          subtotal: Prisma.Decimal;
        }[] = [];

        for (const item of dto.items) {
          const cat = freshEvent!.ticketCategories.find(
            (c) => c.id === item.ticketCategoryId,
          )!;
          if (item.quantity > cat.availableQuantity) {
            throw AppError.conflict(`Insufficient tickets for "${cat.name}"`);
          }
          const subtotal = cat.price.mul(item.quantity);
          totalAmount = totalAmount.add(subtotal);
          bookingItems.push({
            ticketCategoryId: cat.id,
            quantity: item.quantity,
            unitPrice: cat.price,
            subtotal,
          });

          // Reserve seats
          await tx.ticketCategory.update({
            where: { id: cat.id },
            data: { availableQuantity: { decrement: item.quantity } },
          });
        }

        const totalQty = dto.items.reduce((s, i) => s + i.quantity, 0);

        // Decrement event available seats
        await tx.event.update({
          where: { id: dto.eventId },
          data: { availableSeats: { decrement: totalQty } },
        });

        // Create booking
        const created = await tx.booking.create({
          data: {
            bookingRef: generateBookingRef(),
            userId,
            eventId: dto.eventId,
            totalAmount,
            notes: dto.notes,
            items: { createMany: { data: bookingItems } },
          },
          include: { items: true, event: { select: { title: true } } },
        });

        return created;
      });

      // Queue async tasks (non-blocking)
      await Promise.all([
        emailQueue.add("booking_confirmed", {
          type: "booking_confirmed",
          bookingId: booking.id,
        }),
        qrCodeQueue.add("generate", { bookingId: booking.id }),
      ]);

      return booking;
    } finally {
      await releaseLock(lockKey);
    }
  },

  async getUserBookings(
    userId: string,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { page, limit, skip } = getPaginationParams(query);
    const where = {
      userId,
      ...(query.status
        ? {
            status: query.status as
              | "PENDING"
              | "CONFIRMED"
              | "CANCELLED"
              | "REFUNDED",
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              bannerUrl: true,
              dateStart: true,
              venue: true,
              city: true,
            },
          },
          items: {
            include: { ticketCategory: { select: { name: true } } },
          },
          tickets: {
            select: { ticketCode: true, qrCodeUrl: true, isUsed: true },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, page, limit, total);
  },

  async getBookingById(bookingId: string, userId: string, isAdmin = false) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
            dateStart: true,
            dateEnd: true,
            venue: true,
            city: true,
            organizer: { select: { username: true, email: true } },
          },
        },
        items: { include: { ticketCategory: true } },
        tickets: true,
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
        user: {
          select: { id: true, username: true, email: true, phone: true },
        },
      },
    });

    if (!booking) throw AppError.notFound("Booking");
    if (!isAdmin && booking.userId !== userId) throw AppError.forbidden();

    return booking;
  },

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
    isAdmin = false,
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true },
    });

    if (!booking) throw AppError.notFound("Booking");
    if (!isAdmin && booking.userId !== userId) throw AppError.forbidden();
    if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
      throw AppError.badRequest(
        "Booking cannot be cancelled in its current state",
      );
    }

    await prisma.$transaction(async (tx) => {
      // Restore available seats
      for (const item of booking.items) {
        await tx.ticketCategory.update({
          where: { id: item.ticketCategoryId },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }

      const totalQty = booking.items.reduce((s, i) => s + i.quantity, 0);
      await tx.event.update({
        where: { id: booking.eventId },
        data: { availableSeats: { increment: totalQty } },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });
    });

    await emailQueue.add("booking_cancelled", {
      type: "booking_cancelled",
      bookingId,
    });
  },

  async getAdminBookings(query: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
    search?: string;
  }) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.BookingWhereInput = {
      ...(query.status
        ? {
            status: query.status as
              | "PENDING"
              | "CONFIRMED"
              | "CANCELLED"
              | "REFUNDED",
          }
        : {}),
      ...(query.eventId ? { eventId: query.eventId } : {}),
      ...(query.search
        ? {
            OR: [
              { bookingRef: { contains: query.search } },
              { user: { email: { contains: query.search } } },
            ],
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          event: { select: { title: true } },
          user: { select: { username: true, email: true } },
          _count: { select: { tickets: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, page, limit, total);
  },
};
