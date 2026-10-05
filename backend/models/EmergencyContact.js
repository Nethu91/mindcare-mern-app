const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // normalized number, used only to block duplicates (e.g. 94771234567)
    phoneKey: {
      type: String,
      required: true,
    },

    relationship: {
      type: String,
      default: "",
      trim: true,
    },

    // "profile" = copied from the Profile page, "manual" = added in Emergency page
    source: {
      type: String,
      enum: ["manual", "profile"],
      default: "manual",
    },
  },
  { timestamps: true }
);

// same user can't save the same number twice
emergencyContactSchema.index({ userId: 1, phoneKey: 1 }, { unique: true });

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);