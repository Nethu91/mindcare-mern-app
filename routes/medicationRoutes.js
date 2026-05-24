const express = require("express");
const Medication = require("../models/Medication");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { medicineName, dosage, time, note, reminderEnabled } = req.body;

    if (!medicineName || !time) {
      return res.status(400).json({
        message: "Medicine name and time are required",
      });
    }

    const medication = await Medication.create({
      userId: req.user._id,
      medicineName,
      dosage,
      time,
      note,
      reminderEnabled,
    });

    res.status(201).json({
      message: "Medication reminder added successfully",
      medication,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add medication",
      error: error.message,
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const medications = await Medication.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(medications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch medications",
      error: error.message,
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        message: "Medication not found",
      });
    }

    await medication.deleteOne();

    res.status(200).json({
      message: "Medication deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete medication",
      error: error.message,
    });
  }
});

module.exports = router;