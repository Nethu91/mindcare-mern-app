const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    availableDays: {
      type: [String],
      default: [],
    },

    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counselor", counselorSchema);