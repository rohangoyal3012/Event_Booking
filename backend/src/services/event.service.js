const eventModel = require("../models/event.model");

// Create a new event
const createEvent = async (eventData) => {
  try {
    const newEvent = await eventModel.createEvent(eventData);
    return newEvent;
  } catch (error) {
    throw new Error(`Error in createEvent service: ${error.message}`);
  }
};

// Get all events
const getAllEvents = async () => {
  try {
    const events = await eventModel.getAllEvents();
    return events;
  } catch (error) {
    throw new Error(`Error in getAllEvents service: ${error.message}`);
  }
};

// Get event by ID
const getEventById = async (id) => {
  try {
    const event = await eventModel.getEventById(id);
    if (!event) {
      throw new Error("Event not found");
    }
    return event;
  } catch (error) {
    throw new Error(`Error in getEventById service: ${error.message}`);
  }
};

// Update event
const updateEvent = async (id, eventData) => {
  try {
    const updatedEvent = await eventModel.updateEvent(id, eventData);
    if (!updatedEvent) {
      throw new Error("Event not found");
    }
    return updatedEvent;
  } catch (error) {
    throw new Error(`Error in updateEvent service: ${error.message}`);
  }
};

// Delete event
const deleteEvent = async (id) => {
  try {
    const result = await eventModel.deleteEvent(id);
    if (!result) {
      throw new Error("Event not found");
    }
    return { message: "Event deleted successfully" };
  } catch (error) {
    throw new Error(`Error in deleteEvent service: ${error.message}`);
  }
};

// Get events by category
const getEventsByCategory = async (category) => {
  try {
    const events = await eventModel.getEventsByCategory(category);
    return events;
  } catch (error) {
    throw new Error(`Error in getEventsByCategory service: ${error.message}`);
  }
};

// Get events by status
const getEventsByStatus = async (status) => {
  try {
    const events = await eventModel.getEventsByStatus(status);
    return events;
  } catch (error) {
    throw new Error(`Error in getEventsByStatus service: ${error.message}`);
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getEventsByStatus,
};
