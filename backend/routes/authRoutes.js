const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const { generateOtp, hashOtp, sendOtpEmail } = require("../utils/otpEmail");

const User = require("../models/User");

const router = express.Router();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;
const OTP_FIELDS = "+otpHash +otpExpires +otpAttempts +otpLastSentAt";

// ===========================
// Helpers
// ===========================

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// Also returns the customization fields, so the dashboard greeting /
// profile picture is correct right after login.
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  role: user.role,
  nickname: user.nickname,
  photo: user.photo,
  avatarHair: user.avatarHair,
  avatarHairColor: user.avatarHairColor,
  avatarSkin: user.avatarSkin,
  avatarGlasses: user.avatarGlasses,
  avatarBg: user.avatarBg,
});

// Creates a fresh OTP on the user document and emails it
const issueOtp = async (user) => {
  const otp = generateOtp();

  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  user.otpAttempts = 0;
  user.otpLastSentAt = new Date();
  await user.save();

  await sendOtpEmail(user.email, user.name, otp);
};

// ===========================
// REGISTER (sends OTP, no token yet)
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

    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail }).select(OTP_FIELDS);

    if (user && user.isVerified) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      // Registered earlier but never verified -> update details, resend code
      user.name = name;
      user.password = hashedPassword;
      user.age = age;
      user.gender = gender;
    } else {
      user = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
        age,
        gender,
        isVerified: false,
      });
    }

    await issueOtp(user);

    res.status(201).json({
      message: "Verification code sent to your email",
      email: cleanEmail,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Could not send verification email. Please try again.",
      error: error.message,
    });
  }
});

// ===========================
// VERIFY OTP (returns token + user)
// ===========================

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select(OTP_FIELDS);

    if (!user) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (!user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Code expired. Please request a new one." });
    }

    if (user.otpAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many wrong attempts. Please request a new code.",
      });
    }

    if (hashOtp(String(otp).trim()) !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid code" });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLastSentAt = undefined;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      token: generateToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

// ===========================
// RESEND OTP
// ===========================

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select(OTP_FIELDS);

    if (!user || user.isVerified) {
      return res.status(400).json({ message: "Cannot resend code" });
    }

    if (
      user.otpLastSentAt &&
      Date.now() - user.otpLastSentAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return res
        .status(429)
        .json({ message: "Please wait a minute before requesting a new code" });
    }

    await issueOtp(user);

    res.status(200).json({ message: "A new code has been sent" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Could not resend code" });
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

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select(OTP_FIELDS);

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

    // Email not verified yet -> send a fresh code (respecting cooldown)
    // and tell the frontend to open the verify page
    if (!user.isVerified) {
      const recentlySent =
        user.otpLastSentAt &&
        Date.now() - user.otpLastSentAt.getTime() < RESEND_COOLDOWN_MS;

      if (!recentlySent) {
        await issueOtp(user);
      }

      return res.status(403).json({
        message: "Please verify your email. We sent you a code.",
        needsVerification: true,
        email: user.email,
      });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: formatUser(user),
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
// (personal info + customization: nickname, bio, photo, avatar)
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
      // customization
      nickname,
      bio,
      photo,
      avatarHair,
      avatarHairColor,
      avatarSkin,
      avatarGlasses,
      avatarBg,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (age !== undefined) user.age = age === "" ? undefined : age;
    if (gender !== undefined) user.gender = gender;
    if (emergencyName !== undefined) user.emergencyName = emergencyName;
    if (emergencyPhone !== undefined) user.emergencyPhone = emergencyPhone;
    if (goal !== undefined) user.goal = goal;
    if (reminderTime !== undefined) user.reminderTime = reminderTime;
    if (preferredSupport !== undefined)
      user.preferredSupport = preferredSupport;

    // customization (photo = "" is allowed, it clears the photo)
    if (nickname !== undefined) user.nickname = nickname;
    if (bio !== undefined) user.bio = bio;
    if (photo !== undefined) user.photo = photo;
    if (avatarHair !== undefined) user.avatarHair = avatarHair;
    if (avatarHairColor !== undefined) user.avatarHairColor = avatarHairColor;
    if (avatarSkin !== undefined) user.avatarSkin = avatarSkin;
    if (avatarGlasses !== undefined) user.avatarGlasses = !!avatarGlasses;
    if (avatarBg !== undefined) user.avatarBg = avatarBg;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;