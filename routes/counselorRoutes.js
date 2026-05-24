const express = require("express");
const Counselor = require("../models/Counselor");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const counselor = await Counselor.create(req.body);

    res.status(201).json({
      message: "Counselor added successfully",
      counselor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add counselor",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { specialization, location } = req.query;

    const filter = {};

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    const counselors = await Counselor.find(filter).sort({ createdAt: -1 });

    res.status(200).json(counselors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch counselors",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);

    if (!counselor) {
      return res.status(404).json({
        message: "Counselor not found",
      });
    }

    res.status(200).json(counselor);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch counselor",
      error: error.message,
    });
  }
});

module.exports = router;