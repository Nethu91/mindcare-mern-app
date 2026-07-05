const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const User = require("../models/User");

const router = express.Router();

// ===========================
// REGISTER
// ===========================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// ===========================
// LOGIN
// ===========================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
});

// ===========================
// GET /profile
// Returns the logged-in user's full profile (minus password)
// Flat object — matches what Profile.js's loadProfile() expects
// (res.data.phone, res.data.city, etc.)
// ===========================

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
// PUT /profile
// Updates the logged-in user's profile fields
// ===========================

router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      age,
      gender,
      emergencyName,
      emergencyPhone,
      goal,
      reminderTime,
      preferredSupport,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update fields that were actually sent, so a partial
    // save from the frontend never wipes out other fields.
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (emergencyName !== undefined) user.emergencyName = emergencyName;
    if (emergencyPhone !== undefined) user.emergencyPhone = emergencyPhone;
    if (goal !== undefined) user.goal = goal;
    if (reminderTime !== undefined) user.reminderTime = reminderTime;
    if (preferredSupport !== undefined)
      user.preferredSupport = preferredSupport;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;