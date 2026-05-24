const express = require("express");
const Assessment = require("../models/Assessment");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const getPHQ9Level = (score) => {
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  if (score <= 19) return "Moderately Severe";
  return "Severe";
};

const getGAD7Level = (score) => {
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  return "Severe";
};

const getRecommendation = (riskLevel) => {
  if (riskLevel === "Minimal") {
    return "Your answers indicate minimal symptoms. Continue healthy habits and regular self-care.";
  }

  if (riskLevel === "Mild") {
    return "Your answers indicate mild symptoms. Try relaxation activities, journaling, and mood tracking.";
  }

  if (riskLevel === "Moderate") {
    return "Your answers indicate moderate symptoms. Consider speaking with a qualified counselor or mental health professional.";
  }

  return "Your answers indicate a higher level of distress. This is not a medical diagnosis. Please contact a qualified mental health professional or emergency support if you feel unsafe.";
};

router.post("/", protect, async (req, res) => {
  try {
    const { assessmentType, answers } = req.body;

    if (!assessmentType || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        message: "Assessment type and answers are required",
      });
    }

    const score = answers.reduce((sum, value) => sum + Number(value), 0);

    let riskLevel;

    if (assessmentType === "PHQ-9") {
      riskLevel = getPHQ9Level(score);
    } else if (assessmentType === "GAD-7") {
      riskLevel = getGAD7Level(score);
    } else {
      return res.status(400).json({
        message: "Invalid assessment type",
      });
    }

    const recommendation = getRecommendation(riskLevel);

    const assessment = await Assessment.create({
      userId: req.user._id,
      assessmentType,
      answers,
      score,
      riskLevel,
      recommendation,
    });

    res.status(201).json({
      message: "Assessment saved successfully",
      assessment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save assessment",
      error: error.message,
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(assessments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
});

module.exports = router;