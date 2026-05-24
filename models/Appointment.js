const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);