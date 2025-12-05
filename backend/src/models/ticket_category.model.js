const { getPool } = require("../config/db_connection");

// Create ticket_categories table
const createTicketCategoriesTable = async () => {
  const pool = getPool();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ticket_categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_id INT NOT NULL,
      category_name VARCHAR(100) NOT NULL,
      price_multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
      max_tickets_per_user INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event_id (event_id)
    )
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✓ ticket_categories table ready");
  } catch (error) {
    console.error("Error creating ticket_categories table:", error.message);
    throw error;
  }
};

// Create a new ticket category
const createTicketCategory = async (categoryData) => {
  const pool = getPool();
  const { event_id, category_name, price_multiplier, max_tickets_per_user } =
    categoryData;

  const query = `
    INSERT INTO ticket_categories (event_id, category_name, price_multiplier, max_tickets_per_user)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(query, [
      event_id,
      category_name,
      price_multiplier || 1.0,
      max_tickets_per_user || null,
    ]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Get all ticket categories for an event
const getTicketCategoriesByEventId = async (eventId) => {
  const pool = getPool();
  const query = "SELECT * FROM ticket_categories WHERE event_id = ?";

  try {
    const [rows] = await pool.query(query, [eventId]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get a single ticket category by ID
const getTicketCategoryById = async (id) => {
  const pool = getPool();
  const query = "SELECT * FROM ticket_categories WHERE id = ?";

  try {
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Update a ticket category
const updateTicketCategory = async (id, categoryData) => {
  const pool = getPool();
  const allowedFields = [
    "category_name",
    "price_multiplier",
    "max_tickets_per_user",
  ];
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(categoryData)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(id);
  const query = `UPDATE ticket_categories SET ${updates.join(
    ", "
  )} WHERE id = ?`;

  try {
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete a ticket category
const deleteTicketCategory = async (id) => {
  const pool = getPool();
  const query = "DELETE FROM ticket_categories WHERE id = ?";

  try {
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete all ticket categories for an event
const deleteTicketCategoriesByEventId = async (eventId) => {
  const pool = getPool();
  const query = "DELETE FROM ticket_categories WHERE event_id = ?";

  try {
    const [result] = await pool.query(query, [eventId]);
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTicketCategoriesTable,
  createTicketCategory,
  getTicketCategoriesByEventId,
  getTicketCategoryById,
  updateTicketCategory,
  deleteTicketCategory,
  deleteTicketCategoriesByEventId,
};
