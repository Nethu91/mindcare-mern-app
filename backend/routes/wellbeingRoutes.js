const express = require("express");
const { Journal, Preferences, Center } = require("../models/Wellbeing");
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(protect);
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    if (e.name === "ValidationError" || e.name === "CastError")
      return res.status(400).json({ message: "Invalid input" });
    next(e);
  }
};
router.get(
  "/journal",
  wrap(async (req, res) =>
    res.json(
      await Journal.find({ userId: req.user._id }).sort({ createdAt: -1 }),
    ),
  ),
);
router.post(
  "/journal",
  wrap(async (req, res) => {
    const { title, content, mood, tags = [] } = req.body;
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim() ||
      !Array.isArray(tags) ||
      tags.length > 20 ||
      tags.some((t) => typeof t !== "string" || t.length > 50)
    )
      return res
        .status(400)
        .json({ message: "Add a title, thoughts, mood and valid tags" });
    res
      .status(201)
      .json(
        await Journal.create({
          userId: req.user._id,
          title: title.trim(),
          content: content.trim(),
          mood,
          tags,
        }),
      );
  }),
);
router.delete(
  "/journal/:id",
  wrap(async (req, res) => {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    res
      .status(entry ? 200 : 404)
      .json({ message: entry ? "Entry deleted" : "Entry not found" });
  }),
);
async function prefs(userId) {
  return Preferences.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
router.get(
  "/preferences",
  wrap(async (req, res) => res.json(await prefs(req.user._id))),
);
router.patch(
  "/preferences",
  wrap(async (req, res) => {
    const p = await prefs(req.user._id);
    for (const key of [
      "daily",
      "goals",
      "affirmations",
      "sessions",
      "progress",
      "quietEnabled",
    ])
      if (key in req.body) {
        if (typeof req.body[key] !== "boolean")
          return res.status(400).json({ message: "Invalid preference" });
        p[key] = req.body[key];
      }
    for (const key of ["quietStart", "quietEnd"])
      if (key in req.body) {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(req.body[key]))
          return res.status(400).json({ message: "Invalid quiet time" });
        p[key] = req.body[key];
      }
    if (req.body.timeZone) {
      try {
        new Intl.DateTimeFormat("en", { timeZone: req.body.timeZone });
      } catch {
        return res.status(400).json({ message: "Invalid timezone" });
      }
      p.timeZone = req.body.timeZone;
    }
    await p.save();
    res.json(p);
  }),
);
router.get(
  "/notifications",
  wrap(async (req, res) => {
    const p = await prefs(req.user._id),
      dateParts = new Intl.DateTimeFormat("en", {
        timeZone: p.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date()),
      day = ["year", "month", "day"]
        .map((k) => dateParts.find((x) => x.type === k).value)
        .join("-");
    const items = [];
    if (p.daily)
      items.push({
        id: `daily:${day}`,
        title: "Daily Mood Check-in",
        message: "How are you feeling today? Track your mood now.",
        icon: "🔔",
        path: "/mood",
      });
    if (p.affirmations)
      items.push({
        id: `affirmation:${day}`,
        title: "Daily Affirmation",
        message: "You are worthy of love and happiness.",
        icon: "💜",
        path: "/journal",
      });
    if (p.sessions) {
      const appointments = await Appointment.find({
        userId: req.user._id,
        status: { $in: ["Pending", "Accepted"] },
        date: { $gte: day },
      })
        .sort({ date: 1 })
        .limit(10);
      appointments.forEach((a) =>
        items.push({
          id: `appointment:${a._id}:${a.date}:${a.time}`,
          title: "Upcoming Session",
          message: `Your counseling appointment: ${a.date} at ${a.time} (${a.status}).`,
          icon: "📅",
          path: "/appointments",
        }),
      );
    }
    const centers = await Center.find().sort({ updatedAt: -1 }).limit(10);
    centers.forEach((c) =>
      items.push({
        id: `center:${c._id}:${new Date(c.updatedAt).getTime()}`,
        title: "Meditation Center",
        message: `${c.name} — ${c.address}`,
        icon: "🧘",
        path: `/meditation-centers?center=${c._id}`,
      }),
    );
    res.json(items.map((n) => ({ ...n, read: p.readIds.includes(n.id) })));
  }),
);
router.patch(
  "/notifications/read",
  wrap(async (req, res) => {
    const { ids } = req.body;
    if (
      !Array.isArray(ids) ||
      ids.length > 100 ||
      ids.some((id) => typeof id !== "string" || id.length > 200)
    )
      return res.status(400).json({ message: "Invalid notification IDs" });
    await prefs(req.user._id);
    await Preferences.updateOne(
      { userId: req.user._id },
      { $addToSet: { readIds: { $each: ids } } },
    );
    res.json({ message: "Marked as read" });
  }),
);
router.get(
  "/centers",
  wrap(async (req, res) => res.json(await Center.find().sort({ name: 1 }))),
);
module.exports = router;
