import { Router } from "express";
import { paymentsController } from "./payments.controller";
import { authenticate } from "../../middleware/authenticate";
import { webhookRateLimiter } from "../../middleware/rateLimiter";

const router = Router();

router.post(
  "/bookings/:bookingId/order",
  authenticate,
  paymentsController.createOrder,
);
router.post(
  "/bookings/:bookingId/verify",
  authenticate,
  paymentsController.verify,
);
router.post("/webhook", webhookRateLimiter, paymentsController.webhook);

export default router;
