const jwt = require("jsonwebtoken");

// Verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "Error authenticating token" });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({
        error: "Access denied. Admin privileges required.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Error checking admin privileges" });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
};
