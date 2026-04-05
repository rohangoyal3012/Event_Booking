import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { paymentsService } from "./payments.service";

export const paymentsController = {
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const data = await paymentsService.createOrder(
      req.params.bookingId,
      req.user!.id,
    );
    res.json({ success: true, data });
  }),

  verify: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentsService.verifyAndConfirm({
      ...req.body,
      bookingId: req.params.bookingId,
      userId: req.user!.id,
    });
    res.json({ success: true, data: result, message: "Payment verified" });
  }),

  webhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    // Use raw body for webhook signature verification
    await paymentsService.handleWebhook(
      (req as Request & { rawBody?: string }).rawBody ??
        JSON.stringify(req.body),
      signature,
    );
    res.json({ success: true });
  }),
};
