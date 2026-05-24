const express = require("express");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { counselorId, date, time, reason } = req.body;

    if (!counselorId || !date || !time) {
      return res.status(400).json({
        message: "Counselor, date and time are required",
      });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      counselorId,
      date,
      time,
      reason,
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to book appointment",
      error: error.message,
    });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user._id,
    })
      .populate("counselorId")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
});

module.exports = router;