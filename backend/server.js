require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const counselorRoutes = require("./routes/counselorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();

connectDB();

app.use(cors());

// 5mb so the profile photo (base64) is never rejected
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/emergency", emergencyRoutes);

app.use("/api/wellbeing", require("./routes/wellbeingRoutes"));

app.get("/", (req, res) => {
  res.send("MindCare API is running successfully");
});

// Error handler (must come after the routes, before listen)
app.use((err, req, res, next) => {
  console.error(err.message);

  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ message: "That image is too large. Please choose a smaller one." });
  }

  res.status(err.status || 500).json({
    message: "Request failed. Please try again.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});