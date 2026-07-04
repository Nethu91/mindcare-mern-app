const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Counselor",
    },
    specialization: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    experience: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    availability: {
      type: String,
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counselor", counselorSchema);