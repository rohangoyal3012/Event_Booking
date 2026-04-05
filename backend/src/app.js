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

// CORS Configuration - Allow all origins in development
const corsOptions = {
  origin: true, // This allows all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600, // 10 minutes
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.path} - Origin: ${req.headers.origin || "No origin"}`
  );
  next();
});

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
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Bad JSON:", err.message);
    return res.status(400).json({
      error: "Invalid JSON format in request body",
      details: err.message,
    });
  }

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
