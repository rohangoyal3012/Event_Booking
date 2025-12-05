const { getPool } = require("../config/db_connection");
const bcrypt = require("bcryptjs");

// Create users table if it doesn't exist
async function createUsersTable() {
  const pool = getPool();
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;

  try {
    await pool.query(createTableQuery);
    console.log("Users table created/verified successfully");

    // Create default admin user if not exists
    await createDefaultAdmin();
  } catch (error) {
    console.error("Error creating users table:", error);
    throw error;
  }
}

// Create default admin user
async function createDefaultAdmin() {
  const pool = getPool();

  try {
    // Check if admin exists
    const [existingAdmin] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      ["admin@eventbooking.com"]
    );

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ["admin", "admin@eventbooking.com", hashedPassword, "admin"]
      );
      console.log("Default admin user created:");
      console.log("  Email: admin@eventbooking.com");
      console.log("  Password: admin123");
      console.log("  ⚠️  Please change this password in production!");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}

// Create a new user
async function createUser(userData) {
  const pool = getPool();
  const { username, email, password, role = "user" } = userData;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

    const [result] = await pool.query(query, [
      username,
      email,
      hashedPassword,
      role,
    ]);

    return {
      id: result.insertId,
      username,
      email,
      role,
    };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Username or email already exists");
    }
    console.error("Error creating user:", error);
    throw error;
  }
}

// Find user by email
async function findUserByEmail(email) {
  const pool = getPool();
  const query = "SELECT * FROM users WHERE email = ?";

  try {
    const [rows] = await pool.query(query, [email]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
}

// Find user by ID
async function findUserById(id) {
  const pool = getPool();
  const query =
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?";

  try {
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
}

// Verify password
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
}

// Get all users (admin only)
async function getAllUsers() {
  const pool = getPool();
  const query =
    "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC";

  try {
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

module.exports = {
  createUsersTable,
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  getAllUsers,
};
