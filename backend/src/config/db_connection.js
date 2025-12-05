const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

async function connectDb() {
  try {
    // First, create connection without database to create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      port: process.env.DB_PORT || 3306,
    });

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${
        process.env.DB_NAME || "event_booking_db"
      }`
    );
    console.log("Database checked/created successfully");
    await connection.end();

    // Create connection pool with the database
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "event_booking_db",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test the connection
    const testConnection = await pool.getConnection();
    console.log("Database connected successfully");
    testConnection.release();

    return pool;
  } catch (error) {
    console.error("Error during database connection:", error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error("Database pool not initialized. Call connectDb() first.");
  }
  return pool;
}

module.exports = { connectDb, getPool };
