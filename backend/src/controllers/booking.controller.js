const bookingModel = require("../models/booking.model");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { event_id, name, email, mobile, quantity, total_amount } = req.body;

    // Validation
    if (!event_id || !name || !email || !mobile || !quantity || !total_amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const bookingId = await bookingModel.createBooking({
      event_id,
      name,
      email,
      mobile,
      quantity,
      total_amount,
    });

    const booking = await bookingModel.getBookingById(bookingId);
    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create booking" });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Get bookings by event ID
const getBookingsByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;
    const bookings = await bookingModel.getBookingsByEventId(eventId);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Get a single booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingModel.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

// Get bookings by email
const getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await bookingModel.getBookingsByEmail(email);
    res.json({ bookings }); // Return consistent format
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await bookingModel.cancelBooking(id);

    if (!success) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to cancel booking" });
  }
};

// Delete a booking (admin only)
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await bookingModel.deleteBooking(id);

    if (!success) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

// Get booking statistics for an event
const getEventBookingStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const stats = await bookingModel.getEventBookingStats(eventId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ error: "Failed to fetch booking statistics" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingsByEventId,
  getBookingById,
  getBookingsByEmail,
  cancelBooking,
  deleteBooking,
  getEventBookingStats,
};
