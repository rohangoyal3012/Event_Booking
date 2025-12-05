const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const bookingService = require("../services/booking.service");
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

// Public routes
router.post("/bookings", bookingService.bookTickets);
router.get("/bookings/email/:email", bookingController.getBookingsByEmail);
router.get("/bookings/:id", bookingController.getBookingById);
router.put("/bookings/:id/cancel", bookingController.cancelBooking);

// Admin only routes
router.get(
  "/bookings",
  authenticateToken,
  isAdmin,
  bookingController.getAllBookings
);
router.get(
  "/bookings/event/:eventId",
  authenticateToken,
  isAdmin,
  bookingController.getBookingsByEventId
);
router.get(
  "/bookings/event/:eventId/stats",
  authenticateToken,
  isAdmin,
  bookingController.getEventBookingStats
);
router.delete(
  "/bookings/:id",
  authenticateToken,
  isAdmin,
  bookingController.deleteBooking
);

module.exports = router;
