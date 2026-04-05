import { Router } from "express";
import { ticketsController } from "./tickets.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";

const router = Router();

router.get("/booking/:bookingId", authenticate, ticketsController.getByBooking);
router.post(
  "/validate/:code",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  ticketsController.validate,
);

export default router;
