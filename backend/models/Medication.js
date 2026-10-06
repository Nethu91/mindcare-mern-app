const mongoose = require("mongoose");

// ============================================================
// MEDICATION SCHEMA
// ============================================================

const medicationSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // User who owns this medication reminder
    // --------------------------------------------------------
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --------------------------------------------------------
    // Medicine Name
    // Example: Vitamin D, Panadol
    // --------------------------------------------------------
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      maxlength: [100, "Medicine name cannot exceed 100 characters"],
    },

    // --------------------------------------------------------
    // Dosage
    // Example: 1 tablet, 5ml
    // --------------------------------------------------------
    dosage: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Dosage cannot exceed 100 characters"],
    },

    // --------------------------------------------------------
    // Reminder Time
    // Example: 08:00
    // --------------------------------------------------------
    time: {
      type: String,
      required: [true, "Medication time is required"],
      trim: true,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Time must be in HH:MM format",
      ],
    },

    // --------------------------------------------------------
    // Optional Note
    // Example: After meals
    // --------------------------------------------------------
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },

    // --------------------------------------------------------
    // Reminder Status
    // true  = reminder ON
    // false = reminder OFF
    // --------------------------------------------------------
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
  },

  // Automatically creates:
  // createdAt
  // updatedAt
  {
    timestamps: true,
  }
);

// ============================================================
// INDEX
// Helps when loading medications for a specific user
// ============================================================

medicationSchema.index({
  user: 1,
  createdAt: -1,
});

// ============================================================
// CREATE MODEL
// ============================================================

const Medication = mongoose.model(
  "Medication",
  medicationSchema
);

// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = Medication;