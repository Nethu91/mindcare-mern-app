const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // ========================================================
    // GET TOKEN FROM AUTHORIZATION HEADER
    // ========================================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ========================================================
    // CHECK TOKEN
    // ========================================================

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    // ========================================================
    // VERIFY TOKEN
    // ========================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ========================================================
    // GET LOGGED-IN USER
    // ========================================================

    req.user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!req.user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    // ========================================================
    // CONTINUE TO PROTECTED ROUTE
    // ========================================================

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Not authorized. Token failed.",
      error: error.message,
    });
  }
};

module.exports = { protect };