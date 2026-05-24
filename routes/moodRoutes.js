const express = require("express");
const Mood = require("../models/Mood");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { mood, rating, note, tags } = req.body;

    if (!mood || !rating) {
      return res.status(400).json({
        message: "Mood and rating are required",
      });
    }

    const moodEntry = await Mood.create({
      userId: req.user._id,
      mood,
      rating,
      note,
      tags,
    });

    res.status(201).json({
      message: "Mood entry saved successfully",
      moodEntry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save mood entry",
      error: error.message,
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(moods);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch mood entries",
      error: error.message,
    });
  }
});

router.get("/summary", protect, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id });

    const totalEntries = moods.length;

    const averageRating =
      totalEntries > 0
        ? moods.reduce((sum, item) => sum + item.rating, 0) / totalEntries
        : 0;

    res.status(200).json({
      totalEntries,
      averageRating: Number(averageRating.toFixed(2)),
      latestMood: moods.length > 0 ? moods[moods.length - 1].mood : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch mood summary",
      error: error.message,
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const mood = await Mood.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!mood) {
      return res.status(404).json({
        message: "Mood entry not found",
      });
    }

    await mood.deleteOne();

    res.status(200).json({
      message: "Mood entry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete mood entry",
      error: error.message,
    });
  }
});

module.exports = router;