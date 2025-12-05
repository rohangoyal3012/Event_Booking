const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Register new user
const register = async (userData) => {
  try {
    const user = await userModel.createUser(userData);
    return user;
  } catch (error) {
    throw new Error(`Error in register service: ${error.message}`);
  }
};

// Login user
const login = async (email, password) => {
  try {
    // Find user by email
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await userModel.verifyPassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    throw new Error(`Error in login service: ${error.message}`);
  }
};

// Get user profile
const getUserProfile = async (userId) => {
  try {
    const user = await userModel.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Error in getUserProfile service: ${error.message}`);
  }
};

// Get all users (admin only)
const getAllUsers = async () => {
  try {
    const users = await userModel.getAllUsers();
    return users;
  } catch (error) {
    throw new Error(`Error in getAllUsers service: ${error.message}`);
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  getAllUsers,
};
