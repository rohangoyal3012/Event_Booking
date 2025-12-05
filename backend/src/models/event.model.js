const { getPool } = require("../config/db_connection");

// Create events table if it doesn't exist
async function createEventsTable() {
  const pool = getPool();
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location VARCHAR(255) NOT NULL,
            capacity INT NOT NULL,
            available_seats INT NOT NULL,
            price DECIMAL(10, 2) DEFAULT 0.00,
            organizer VARCHAR(255),
            category VARCHAR(100),
            image_url VARCHAR(500),
            status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    throw error;
  }
}

// Create a new event
async function createEvent(eventData) {
  const pool = getPool();
  const {
    title,
    description,
    date,
    time,
    location,
    capacity,
    price = 0,
    organizer,
    category,
    image_url,
    status = "upcoming",
  } = eventData;

  const available_seats = capacity; // Initially, all seats are available

  const query = `
        INSERT INTO events (title, description, date, time, location, capacity, available_seats, price, organizer, category, image_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  try {
    const [result] = await pool.query(query, [
      title,
      description,
      date,
      time,
      location,
      capacity,
      available_seats,
      price,
      organizer,
      category,
      image_url,
      status,
    ]);
    return { id: result.insertId, ...eventData, available_seats };
  } catch (error) {
    throw error;
  }
}

// Get all events
async function getAllEvents() {
  const pool = getPool();
  const query = "SELECT * FROM events ORDER BY date ASC, time ASC";

  try {
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
}

// Get event by ID
async function getEventById(id) {
  const pool = getPool();
  const query = "SELECT * FROM events WHERE id = ?";

  try {
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
}

// Update event
async function updateEvent(id, eventData) {
  const pool = getPool();
  const fields = [];
  const values = [];

  // Fields that should not be updated
  const excludedFields = ["id", "created_at", "updated_at", "available_seats"];

  // Check if capacity is being updated
  let capacityChange = null;
  if (eventData.capacity !== undefined) {
    // Get current event to calculate capacity difference
    const currentEvent = await getEventById(id);
    if (currentEvent) {
      const oldCapacity = currentEvent.capacity;
      const newCapacity = parseInt(eventData.capacity);
      capacityChange = newCapacity - oldCapacity;
    }
  }

  // Build dynamic update query based on provided fields
  Object.keys(eventData).forEach((key) => {
    if (eventData[key] !== undefined && !excludedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(eventData[key]);
    }
  });

  // If capacity changed, also update available_seats
  if (capacityChange !== null && capacityChange !== 0) {
    fields.push(`available_seats = GREATEST(0, available_seats + ?)`);
    values.push(capacityChange);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);
  const query = `UPDATE events SET ${fields.join(", ")} WHERE id = ?`;

  try {
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      return null;
    }
    return await getEventById(id);
  } catch (error) {
    throw error;
  }
}

// Delete event
async function deleteEvent(id) {
  const pool = getPool();
  const query = "DELETE FROM events WHERE id = ?";

  try {
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
}

// Get events by category
async function getEventsByCategory(category) {
  const pool = getPool();
  const query =
    "SELECT * FROM events WHERE category = ? ORDER BY date ASC, time ASC";

  try {
    const [rows] = await pool.query(query, [category]);
    return rows;
  } catch (error) {
    console.error("Error getting events by category:", error);
    throw error;
  }
}

// Get events by status
async function getEventsByStatus(status) {
  const pool = getPool();
  const query =
    "SELECT * FROM events WHERE status = ? ORDER BY date ASC, time ASC";

  try {
    const [rows] = await pool.query(query, [status]);
    return rows;
  } catch (error) {
    console.error("Error getting events by status:", error);
    throw error;
  }
}

module.exports = {
  createEventsTable,
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getEventsByStatus,
};
