const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mood: {
      type: String,
      required: true,
      enum: ["Happy", "Sad", "Anxious", "Stressed", "Calm", "Angry", "Tired"],
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    note: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mood", moodSchema);