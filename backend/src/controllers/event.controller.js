const eventService = require("../services/event.service");

// Create a new event
const createEvent = async (req, res) => {
  try {
    const eventData = req.body;

    // Basic validation
    if (
      !eventData.title ||
      !eventData.date ||
      !eventData.time ||
      !eventData.location ||
      !eventData.capacity
    ) {
      return res.status(400).json({
        error: "Missing required fields: title, date, time, location, capacity",
      });
    }

    const newEvent = await eventService.createEvent(eventData);
    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Error in createEvent controller:", error);
    res.status(500).json({ error: error.message || "Error creating event" });
  }
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const { category, status } = req.query;

    let events;
    if (category) {
      events = await eventService.getEventsByCategory(category);
    } else if (status) {
      events = await eventService.getEventsByStatus(status);
    } else {
      events = await eventService.getAllEvents();
    }

    res.status(200).json({
      message: "Events retrieved successfully",
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Error in getEvents controller:", error);
    res.status(500).json({ error: error.message || "Error retrieving events" });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await eventService.getEventById(id);
    res.status(200).json({
      message: "Event retrieved successfully",
      event,
    });
  } catch (error) {
    console.error("Error in getEventById controller:", error);
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: error.message || "Error retrieving event" });
    }
  }
};

// Update event by ID
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    if (Object.keys(eventData).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }

    const updatedEvent = await eventService.updateEvent(id, eventData);
    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error in updateEvent controller:", error);
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || "Error updating event" });
    }
  }
};

// Delete event by ID
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const result = await eventService.deleteEvent(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in deleteEvent controller:", error);
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message || "Error deleting event" });
    }
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
