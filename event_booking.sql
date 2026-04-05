-- Event Booking System Database Schema
-- MySQL Database Script
-- Created: December 6, 2025

-- Create Database
CREATE DATABASE IF NOT EXISTS event_booking_db;
USE event_booking_db;

-- =============================================
-- Table: users
-- Description: Stores user account information
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: events
-- Description: Stores event information
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    available_seats INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0.00,
    organizer VARCHAR(100),
    category VARCHAR(50),
    image_url VARCHAR(255),
    status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: ticket_categories
-- Description: Stores different ticket types for events
-- =============================================
CREATE TABLE IF NOT EXISTS ticket_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    available_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: bookings
-- Description: Stores user booking information
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    ticket_category_id INT NOT NULL,
    number_of_tickets INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    booking_status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_category_id) REFERENCES ticket_categories(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_booking_status (booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert Default Admin User
-- Email: admin@eventbooking.com
-- Password: admin123 (hashed with bcrypt)
-- =============================================
INSERT INTO users (username, email, password, role) 
VALUES (
    'Admin User', 
    'admin@eventbooking.com', 
    '$2a$10$rZ5Y8P6mEzKvY8tHG5Y8P6mEzKvY8tHG5Y8P6mEzKvY8tHG5Y8Pe', 
    'admin'
) ON DUPLICATE KEY UPDATE username = username;

-- =============================================
-- Sample Events (Optional - for testing)
-- =============================================
INSERT INTO events (title, description, date, time, location, capacity, available_seats, price, organizer, category, status) 
VALUES 
(
    'Tech Conference 2025',
    'Annual technology conference featuring industry leaders',
    '2025-12-15',
    '09:00:00',
    'Convention Center, Mumbai',
    500,
    500,
    2500.00,
    'Tech Community',
    'Technology',
    'upcoming'
),
(
    'Music Festival',
    'Live music performances by popular artists',
    '2025-12-20',
    '18:00:00',
    'Stadium, Delhi',
    1000,
    1000,
    1500.00,
    'Music Events Inc',
    'Music',
    'upcoming'
),
(
    'Art Exhibition',
    'Contemporary art showcase',
    '2025-12-10',
    '10:00:00',
    'Art Gallery, Bangalore',
    200,
    200,
    500.00,
    'Art Foundation',
    'Art',
    'upcoming'
)
ON DUPLICATE KEY UPDATE title = title;

-- =============================================
-- Sample Ticket Categories (Optional - for testing)
-- =============================================
INSERT INTO ticket_categories (event_id, category_name, price, available_quantity)
VALUES
(1, 'VIP', 5000.00, 100),
(1, 'Regular', 2500.00, 300),
(1, 'Student', 1500.00, 100),
(2, 'VIP', 3000.00, 200),
(2, 'Regular', 1500.00, 600),
(2, 'Student', 800.00, 200),
(3, 'VIP', 1000.00, 50),
(3, 'Regular', 500.00, 100),
(3, 'Student', 250.00, 50)
ON DUPLICATE KEY UPDATE category_name = category_name;

-- =============================================
-- Views for easier data retrieval
-- =============================================

-- View: booking_details
-- Complete booking information with user and event details
CREATE OR REPLACE VIEW booking_details AS
SELECT 
    b.id AS booking_id,
    b.booking_status,
    b.number_of_tickets,
    b.total_amount,
    b.booking_date,
    u.id AS user_id,
    u.username,
    u.email,
    e.id AS event_id,
    e.title AS event_title,
    e.date AS event_date,
    e.time AS event_time,
    e.location AS event_location,
    tc.category_name AS ticket_category,
    tc.price AS ticket_price
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN events e ON b.event_id = e.id
JOIN ticket_categories tc ON b.ticket_category_id = tc.id;

-- View: event_summary
-- Event information with total bookings
CREATE OR REPLACE VIEW event_summary AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.date,
    e.time,
    e.location,
    e.capacity,
    e.available_seats,
    e.price,
    e.organizer,
    e.category,
    e.status,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.number_of_tickets), 0) AS tickets_sold,
    e.created_at
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id AND b.booking_status = 'confirmed'
GROUP BY e.id;

-- =============================================
-- Stored Procedures
-- =============================================

-- Procedure: create_booking
-- Creates a new booking and updates available seats
DELIMITER //

CREATE PROCEDURE create_booking(
    IN p_user_id INT,
    IN p_event_id INT,
    IN p_ticket_category_id INT,
    IN p_number_of_tickets INT,
    OUT p_booking_id INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_available_seats INT;
    DECLARE v_ticket_price DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_available_quantity INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Get available seats for event
    SELECT available_seats INTO v_available_seats
    FROM events
    WHERE id = p_event_id
    FOR UPDATE;
    
    -- Get ticket category details
    SELECT price, available_quantity INTO v_ticket_price, v_available_quantity
    FROM ticket_categories
    WHERE id = p_ticket_category_id
    FOR UPDATE;
    
    -- Check if enough seats available
    IF v_available_seats < p_number_of_tickets THEN
        SET p_message = 'Not enough seats available';
        ROLLBACK;
    ELSEIF v_available_quantity < p_number_of_tickets THEN
        SET p_message = 'Not enough tickets in this category';
        ROLLBACK;
    ELSE
        -- Calculate total amount
        SET v_total_amount = v_ticket_price * p_number_of_tickets;
        
        -- Create booking
        INSERT INTO bookings (user_id, event_id, ticket_category_id, number_of_tickets, total_amount)
        VALUES (p_user_id, p_event_id, p_ticket_category_id, p_number_of_tickets, v_total_amount);
        
        SET p_booking_id = LAST_INSERT_ID();
        
        -- Update available seats
        UPDATE events
        SET available_seats = available_seats - p_number_of_tickets
        WHERE id = p_event_id;
        
        -- Update ticket category quantity
        UPDATE ticket_categories
        SET available_quantity = available_quantity - p_number_of_tickets
        WHERE id = p_ticket_category_id;
        
        SET p_message = 'Booking created successfully';
        COMMIT;
    END IF;
END //

DELIMITER ;

-- =============================================
-- Triggers
-- =============================================

-- Trigger: before_event_insert
-- Ensure available_seats equals capacity on event creation
DELIMITER //

CREATE TRIGGER before_event_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
    IF NEW.available_seats IS NULL OR NEW.available_seats = 0 THEN
        SET NEW.available_seats = NEW.capacity;
    END IF;
END //

DELIMITER ;

-- =============================================
-- Indexes for Performance
-- =============================================

-- Additional indexes for better query performance
CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_event_date_status ON events(date, status);
CREATE INDEX idx_user_email_role ON users(email, role);

-- =============================================
-- Grant Permissions (Optional)
-- Run these if you have a specific user
-- =============================================

-- GRANT ALL PRIVILEGES ON event_booking_db.* TO 'eventuser'@'localhost';
-- FLUSH PRIVILEGES;

-- =============================================
-- End of Script
-- =============================================

SELECT 'Database schema created successfully!' AS Status;
