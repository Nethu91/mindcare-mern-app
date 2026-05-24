const express = require("express");
const Resource = require("../models/Resource");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const resource = await Resource.create(req.body);

    res.status(201).json({
      message: "Resource added successfully",
      resource,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add resource",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { type, category, language } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (language) filter.language = language;

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
});

module.exports = router;