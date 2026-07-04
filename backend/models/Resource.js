const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["Article", "Video", "Music", "Meditation"],
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    url: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      enum: ["English", "Sinhala", "Tamil"],
      default: "English",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);