import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ticketsService } from "./tickets.service";

export const ticketsController = {
  getByBooking: asyncHandler(async (req: Request, res: Response) => {
    const tickets = await ticketsService.getTicketsByBooking(
      req.params.bookingId,
      req.user!.id,
    );
    res.json({ success: true, data: { tickets } });
  }),

  validate: asyncHandler(async (req: Request, res: Response) => {
    const result = await ticketsService.validateTicket(
      req.params.code,
      req.user!.id,
    );
    res.json({ success: true, data: result });
  }),
};
