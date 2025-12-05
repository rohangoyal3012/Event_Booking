const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDb } = require("./config/db_connection");
const { createEventsTable } = require("./models/event.model");
const { createUsersTable } = require("./models/user.model");
const {
  createTicketCategoriesTable,
} = require("./models/ticket_category.model");
const { createBookingsTable } = require("./models/booking.model");
const eventRoutes = require("./routes/event.route");
const authRoutes = require("./routes/auth.route");
const bookingRoutes = require("./routes/booking.route");

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"]
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Event Booking API",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      events: "/api/events",
      bookings: "/api/bookings",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to database
    await connectDb();

    // Create tables if they don't exist
    await createUsersTable();
    await createEventsTable();
    await createTicketCategoriesTable();
    await createBookingsTable();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
