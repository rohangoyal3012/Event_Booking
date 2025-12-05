const bookingModel = require("../models/booking.model");
const eventModel = require("../models/event.model");
const { getPool } = require("../config/db_connection");

// Book tickets with seat availability check and transaction
const bookTickets = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const { event_id, name, email, mobile, quantity } = req.body;

    // Validation
    if (!event_id || !name || !email || !mobile || !quantity) {
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

    // Start transaction
    await connection.beginTransaction();

    // Get event details with lock
    const [events] = await connection.query(
      "SELECT * FROM events WHERE id = ? FOR UPDATE",
      [event_id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Event not found" });
    }

    const event = events[0];

    // Check seat availability
    if (event.available_seats < quantity) {
      await connection.rollback();
      return res.status(400).json({
        error: "Not enough seats available",
        available_seats: event.available_seats,
        requested: quantity,
      });
    }

    // Calculate total amount (base price * quantity * dynamic pricing factor)
    const basePrice = parseFloat(event.price);
    const dynamicFactor = parseFloat(event.dynamic_pricing_factor || 1.0);
    const total_amount = basePrice * quantity * dynamicFactor;

    // Create booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (event_id, name, email, mobile, quantity, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [event_id, name, email, mobile, quantity, total_amount.toFixed(2)]
    );

    // Update available seats
    await connection.query(
      "UPDATE events SET available_seats = available_seats - ? WHERE id = ?",
      [quantity, event_id]
    );

    // Commit transaction
    await connection.commit();

    // Fetch the created booking with event details
    const booking = await bookingModel.getBookingById(bookingResult.insertId);

    res.status(201).json({
      message: "Booking successful!",
      booking,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message || "Failed to book tickets" });
  } finally {
    connection.release();
  }
};

module.exports = {
  bookTickets,
};
