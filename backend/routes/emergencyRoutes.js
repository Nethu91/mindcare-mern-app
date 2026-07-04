const express = require("express");
const EmergencyContact = require("../models/EmergencyContact");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/helplines", (req, res) => {
  res.status(200).json([
    {
      name: "National Mental Health Helpline",
      phone: "1926",
      country: "Sri Lanka",
    },
    {
      name: "Emergency Ambulance",
      phone: "1990",
      country: "Sri Lanka",
    },
    {
      name: "Police Emergency",
      phone: "119",
      country: "Sri Lanka",
    },
  ]);
});

router.post("/contacts", protect, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone number are required",
      });
    }

    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name,
      phone,
      relationship,
    });

    res.status(201).json({
      message: "Emergency contact added successfully",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add emergency contact",
      error: error.message,
    });
  }
});

router.get("/contacts", protect, async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch emergency contacts",
      error: error.message,
    });
  }
});

router.delete("/contacts/:id", protect, async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        message: "Emergency contact not found",
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete emergency contact",
      error: error.message,
    });
  }
});

module.exports = router;