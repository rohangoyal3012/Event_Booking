const { getPool } = require("../config/db_connection");

// Create bookings table
const createBookingsTable = async () => {
  const pool = getPool();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      quantity INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event_id (event_id),
      INDEX idx_email (email),
      INDEX idx_status (status)
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✓ bookings table ready");
  } catch (error) {
    console.error("Error creating bookings table:", error.message);
    throw error;
  }
};

// Create a new booking
const createBooking = async (bookingData) => {
  const { event_id, name, email, mobile, quantity, total_amount } = bookingData;
  const pool = getPool();
  const query = `
    INSERT INTO bookings (event_id, name, email, mobile, quantity, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
  `;

  try {
    const [result] = await pool.query(query, [
      event_id,
      name,
      email,
      mobile,
      quantity,
      total_amount,
    ]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get all bookings
const getAllBookings = async () => {
  const pool = getPool();
  const query = `
    SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location
    FROM bookings b
    LEFT JOIN events e ON b.event_id = e.id
    ORDER BY b.booking_date DESC
  `;

  try {
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get bookings by event ID
const getBookingsByEventId = async (eventId) => {
  const pool = getPool();
  const query = `
    SELECT b.*, e.title as event_title, e.date as event_date
    FROM bookings b
    LEFT JOIN events e ON b.event_id = e.id
    WHERE b.event_id = ?
    ORDER BY b.booking_date DESC
  `;

  try {
    const [rows] = await pool.query(query, [eventId]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get a single booking by ID
const getBookingById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location
    FROM bookings b
    LEFT JOIN events e ON b.event_id = e.id
    WHERE b.id = ?
  `;

  try {
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get bookings by email
const getBookingsByEmail = async (email) => {
  const pool = getPool();
  const query = `
    SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location
    FROM bookings b
    LEFT JOIN events e ON b.event_id = e.id
    WHERE b.email = ?
    ORDER BY b.booking_date DESC
  `;

  try {
    const [rows] = await pool.query(query, [email]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update booking status
const updateBookingStatus = async (id, status) => {
  const pool = getPool();
  const query = "UPDATE bookings SET status = ? WHERE id = ?";

  try {
    const [result] = await pool.query(query, [status, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Cancel booking and restore seats
const cancelBooking = async (id) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Get booking details
    const [bookings] = await connection.query(
      "SELECT event_id, quantity, status FROM bookings WHERE id = ?",
      [id]
    );

    if (bookings.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookings[0];

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    // Update booking status to cancelled
    await connection.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    // Restore available seats
    await connection.query(
      "UPDATE events SET available_seats = available_seats + ? WHERE id = ?",
      [booking.quantity, booking.event_id]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete a booking
const deleteBooking = async (id) => {
  const pool = getPool();
  const query = "DELETE FROM bookings WHERE id = ?";

  try {
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Get booking statistics for an event
const getEventBookingStats = async (eventId) => {
  const pool = getPool();
  const query = `
    SELECT 
      COUNT(*) as total_bookings,
      SUM(CASE WHEN status = 'confirmed' THEN quantity ELSE 0 END) as total_tickets_sold,
      SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as total_revenue,
      SUM(CASE WHEN status = 'cancelled' THEN quantity ELSE 0 END) as cancelled_tickets
    FROM bookings
    WHERE event_id = ?
  `;

  try {
    const [rows] = await pool.query(query, [eventId]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBookingsTable,
  createBooking,
  getAllBookings,
  getBookingsByEventId,
  getBookingById,
  getBookingsByEmail,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  getEventBookingStats,
};
