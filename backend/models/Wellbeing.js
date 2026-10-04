const mongoose = require("mongoose");
const owner = {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true,
};
const Journal = mongoose.model(
  "Journal",
  new mongoose.Schema(
    {
      userId: owner,
      title: { type: String, required: true, maxlength: 150 },
      content: { type: String, required: true, maxlength: 20000 },
      mood: {
        type: String,
        enum: ["Happy", "Peaceful", "Anxious", "Sad", "Angry"],
        required: true,
      },
      tags: [String],
    },
    { timestamps: true },
  ),
);
const Preferences = mongoose.model(
  "NotificationPreferences",
  new mongoose.Schema({
    userId: { ...owner, unique: true },
    daily: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    affirmations: { type: Boolean, default: true },
    sessions: { type: Boolean, default: true },
    progress: { type: Boolean, default: true },
    quietEnabled: { type: Boolean, default: false },
    quietStart: { type: String, default: "22:00" },
    quietEnd: { type: String, default: "07:00" },
    timeZone: { type: String, default: "Asia/Colombo" },
    readIds: { type: [String], default: [] },
  }),
);
const Center = mongoose.model(
  "MeditationCenter",
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: String,
      description: String,
      classes: [String],
      latitude: Number,
      longitude: Number,
      hours: [{ day: Number, start: String, end: String }],
      timeZone: { type: String, default: "Asia/Colombo" },
      rating: Number,
      reviewCount: Number,
    },
    { timestamps: true },
  ),
);
module.exports = { Journal, Preferences, Center };
