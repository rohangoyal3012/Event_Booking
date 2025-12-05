const authService = require("../services/auth.service");

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: username, email, password",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const user = await authService.register({
      username,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(400).json({ error: error.message || "Error registering user" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Missing required fields: email, password",
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    if (error.message.includes("Invalid email or password")) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Error logging in" });
    }
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res.status(404).json({ error: error.message || "User not found" });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({ error: error.message || "Error retrieving users" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
};
