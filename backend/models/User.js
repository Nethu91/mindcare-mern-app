const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
    },

    gender: {
      type: String,
    },

    role: {
      type: String,
      default: "user",
    },

    // ===========================
    // Email verification (OTP)
    // Default is TRUE so users who registered before this feature
    // keep working. New registrations explicitly set it to false.
    // ===========================

    isVerified: {
      type: Boolean,
      default: true,
    },

    // select:false -> never returned by normal queries (safer).
    // Use .select("+otpHash +otpExpires +otpAttempts +otpLastSentAt") when needed.
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLastSentAt: { type: Date, select: false },

    // ===========================
    // Profile fields
    // ===========================

    phone: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    emergencyName: {
      type: String,
      default: "",
    },

    emergencyPhone: {
      type: String,
      default: "",
    },

    // ===========================
    // Profile customization
    // ===========================

    nickname: {
      type: String,
      default: "",
      maxlength: 30,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 150,
    },

    // small resized image stored as a base64 data URL
    photo: {
      type: String,
      default: "",
    },

    avatarHair: {
      type: String,
      default: "long",
    },

    avatarHairColor: {
      type: String,
      default: "#2b1608",
    },

    avatarSkin: {
      type: Number,
      default: 1,
    },

    avatarGlasses: {
      type: Boolean,
      default: false,
    },

    avatarBg: {
      type: String,
      default: "#B7DED6",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);