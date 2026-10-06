const express = require("express");
const Medication = require("../models/Medication");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// ADD MEDICATION
// POST /api/medications
// ============================================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      time,
      note,
      reminderEnabled,
    } = req.body;

    // Validation
    if (!medicineName || !medicineName.trim() || !time) {
      return res.status(400).json({
        message: "Medicine name and time are required",
      });
    }

    const medication = await Medication.create({
      user: req.user._id,

      medicineName: medicineName.trim(),

      dosage: dosage?.trim() || "",

      time,

      note: note?.trim() || "",

      reminderEnabled:
        typeof reminderEnabled === "boolean"
          ? reminderEnabled
          : true,
    });

    return res.status(201).json({
      message: "Medication reminder added successfully",
      medication,
    });
  } catch (error) {
    console.error("Add medication error:", error);

    return res.status(500).json({
      message: "Failed to add medication",
      error: error.message,
    });
  }
});

// ============================================================
// GET ALL MEDICATIONS FOR LOGGED-IN USER
// GET /api/medications
// ============================================================

router.get("/", protect, async (req, res) => {
  try {
    const medications = await Medication.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json(medications);
  } catch (error) {
    console.error("Fetch medications error:", error);

    return res.status(500).json({
      message: "Failed to fetch medications",
      error: error.message,
    });
  }
});

// ============================================================
// UPDATE MEDICATION / TOGGLE REMINDER
// PUT /api/medications/:id
// ============================================================

router.put("/:id", protect, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        message: "Medication not found",
      });
    }

    const {
      medicineName,
      dosage,
      time,
      note,
      reminderEnabled,
    } = req.body;

    // Only update fields that were sent
    if (medicineName !== undefined) {
      if (!medicineName.trim()) {
        return res.status(400).json({
          message: "Medicine name cannot be empty",
        });
      }

      medication.medicineName = medicineName.trim();
    }

    if (dosage !== undefined) {
      medication.dosage = dosage.trim();
    }

    if (time !== undefined) {
      medication.time = time;
    }

    if (note !== undefined) {
      medication.note = note.trim();
    }

    if (reminderEnabled !== undefined) {
      medication.reminderEnabled = reminderEnabled;
    }

    const updatedMedication = await medication.save();

    return res.status(200).json({
      message: "Medication updated successfully",
      medication: updatedMedication,
    });
  } catch (error) {
    console.error("Update medication error:", error);

    return res.status(500).json({
      message: "Failed to update medication",
      error: error.message,
    });
  }
});

// ============================================================
// DELETE MEDICATION
// DELETE /api/medications/:id
// ============================================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({
        message: "Medication not found",
      });
    }

    await medication.deleteOne();

    return res.status(200).json({
      message: "Medication deleted successfully",
    });
  } catch (error) {
    console.error("Delete medication error:", error);

    return res.status(500).json({
      message: "Failed to delete medication",
      error: error.message,
    });
  }
});

module.exports = router;