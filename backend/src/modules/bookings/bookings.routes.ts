import { Router } from "express";
import { bookingsController } from "./bookings.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validateBody } from "../../middleware/validate";
import { bookingRateLimiter } from "../../middleware/rateLimiter";
import { createBookingSchema, cancelBookingSchema } from "./bookings.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  bookingRateLimiter,
  validateBody(createBookingSchema),
  bookingsController.create,
);
router.get("/me", authenticate, bookingsController.getMyBookings);
router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  bookingsController.getAll,
);
router.get("/:id", authenticate, bookingsController.getById);
router.post(
  "/:id/cancel",
  authenticate,
  validateBody(cancelBookingSchema),
  bookingsController.cancel,
);

export default router;
