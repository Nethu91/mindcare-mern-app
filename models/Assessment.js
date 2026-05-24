const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assessmentType: {
      type: String,
      required: true,
      enum: ["PHQ-9", "GAD-7"],
    },

    answers: {
      type: [Number],
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    riskLevel: {
      type: String,
      required: true,
    },

    recommendation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);