const express = require("express");
const {
  register,
  login,
  getProfile,
  getAllUsers,
} = require("../controllers/auth.controller");
const { authenticateToken, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", authenticateToken, getProfile);

// Admin only routes
router.get("/users", authenticateToken, isAdmin, getAllUsers);

module.exports = router;
