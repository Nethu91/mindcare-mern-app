const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
    },

    dosage: {
      type: String,
      default: "",
    },

    time: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    reminderEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);