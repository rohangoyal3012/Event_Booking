const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event.controller");

const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes - anyone can view events
router.get("/events", getEvents);
router.get("/events/:id", getEventById);

// Protected routes - admin only
router.post("/events", authenticateToken, isAdmin, createEvent);
router.put("/events/:id", authenticateToken, isAdmin, updateEvent);
router.delete("/events/:id", authenticateToken, isAdmin, deleteEvent);

module.exports = router;
