const express = require("express");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// Book Appointment
// ======================================

router.post("/", protect, async (req, res) => {
  try {
    const { counselorId, date, time, reason } = req.body;

    if (!counselorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Counselor, date and time are required",
      });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      counselorId,
      date: new Date(date),
      time,
      reason,
      status: "Pending",
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    ).populate("counselorId");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
});

// ======================================
// Get My Appointments
// ======================================

router.get("/my", protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user._id,
      status: { $ne: "Cancelled" },
    })
      .populate("counselorId")
      .sort({
        date: 1,
        time: 1,
      });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Fetch Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});

// ======================================
// Get Next Upcoming Appointment
// ======================================

router.get("/next", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointment = await Appointment.findOne({
      userId: req.user._id,
      status: { $ne: "Cancelled" },
      date: { $gte: today },
    })
      .populate("counselorId")
      .sort({
        date: 1,
        time: 1,
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "No upcoming appointment",
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Next Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming appointment",
      error: error.message,
    });
  }
});

// ======================================
// Cancel Appointment
// ======================================

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "Cancelled";

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
});

module.exports = router;