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
    // Profile fields
    // (added to support the Profile page)
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

    goal: {
      type: String,
      default: "",
    },

    reminderTime: {
      type: String,
      default: "",
    },

    preferredSupport: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);