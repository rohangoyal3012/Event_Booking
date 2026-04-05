import QRCode from "qrcode";
import { cloudinary, CLOUDINARY_FOLDERS } from "../../config/cloudinary";
import { prisma } from "../../config/database";
import { generateTicketCode } from "../../utils/bookingRef";
import { AppError } from "../../utils/AppError";

export const ticketsService = {
  async generateTicketsForBooking(bookingId: string): Promise<void> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: { include: { ticketCategory: true } },
        event: { select: { title: true, dateStart: true, venue: true } },
        user: { select: { username: true, email: true } },
      },
    });

    if (!booking) throw AppError.notFound("Booking");

    const ticketData: {
      bookingId: string;
      ticketCode: string;
      qrCodeUrl: string;
    }[] = [];

    for (const item of booking.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = generateTicketCode();
        const qrPayload = JSON.stringify({
          code: ticketCode,
          bookingRef: booking.bookingRef,
          event: booking.event.title,
          date: booking.event.dateStart,
          holder: booking.user.username,
          category: item.ticketCategory.name,
        });

        // Generate QR as buffer
        const qrBuffer = await QRCode.toBuffer(qrPayload, {
          errorCorrectionLevel: "H",
          type: "png",
          margin: 2,
          width: 300,
        });

        const base64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: CLOUDINARY_FOLDERS.qrcodes,
          public_id: `qr_${ticketCode}`,
        });

        ticketData.push({
          bookingId,
          ticketCode,
          qrCodeUrl: uploadResult.secure_url,
        });
      }
    }

    await prisma.ticket.createMany({ data: ticketData });
  },

  async getTicketsByBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw AppError.notFound("Booking");
    if (booking.userId !== userId) throw AppError.forbidden();

    return prisma.ticket.findMany({ where: { bookingId } });
  },

  async validateTicket(ticketCode: string, operatorId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        booking: {
          include: {
            event: {
              select: { organizerId: true, title: true, dateStart: true },
            },
            user: { select: { username: true, email: true } },
          },
        },
      },
    });

    if (!ticket) throw AppError.notFound("Ticket");
    if (ticket.booking.event.organizerId !== operatorId)
      throw AppError.forbidden();
    if (ticket.isUsed) throw AppError.conflict("Ticket already used");
    if (ticket.booking.status !== "CONFIRMED")
      throw AppError.badRequest("Booking is not confirmed");

    await prisma.ticket.update({
      where: { ticketCode },
      data: { isUsed: true, usedAt: new Date() },
    });

    return {
      valid: true,
      ticket,
      booking: ticket.booking,
    };
  },
};
