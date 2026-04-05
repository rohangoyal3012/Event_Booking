import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { bookingsService } from "./bookings.service";

export const bookingsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingsService.createBooking(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { booking },
    });
  }),

  getMyBookings: asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingsService.getUserBookings(
      req.user!.id,
      req.query as Record<string, string>,
    );
    res.json({ success: true, ...result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === "ADMIN";
    const booking = await bookingsService.getBookingById(
      req.params.id,
      req.user!.id,
      isAdmin,
    );
    res.json({ success: true, data: { booking } });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === "ADMIN";
    await bookingsService.cancelBooking(
      req.params.id,
      req.user!.id,
      req.body?.reason,
      isAdmin,
    );
    res.json({ success: true, message: "Booking cancelled" });
  }),

  // Admin
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingsService.getAdminBookings(
      req.query as Record<string, string>,
    );
    res.json({ success: true, ...result });
  }),
};
