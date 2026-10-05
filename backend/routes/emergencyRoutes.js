const express = require("express");
const crypto = require("crypto");

const EmergencyContact = require("../models/EmergencyContact");
const LocationShare = require("../models/LocationShare");
const User = require("../models/User"); // adjust path/name if different
const { protect } = require("../middleware/authMiddleware");
const { phoneKey } = require("../utils/phone");

const router = express.Router();

/* =====================================================
   HELPLINES
   ===================================================== */
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

/* =====================================================
   Copy the Profile emergency contact into the contacts list
   (no duplicates: matched by normalized phone number)
   ===================================================== */
async function syncProfileContact(userId) {
  const user = await User.findById(userId).select("emergencyName emergencyPhone");
  const key = phoneKey(user?.emergencyPhone);

  // nothing (or invalid number) saved in Profile -> remove old profile-linked copy
  if (!key || key.length < 9) {
    await EmergencyContact.deleteMany({ userId, source: "profile" });
    return;
  }

  // phone changed in Profile -> remove the old profile-linked copy
  await EmergencyContact.deleteMany({
    userId,
    source: "profile",
    phoneKey: { $ne: key },
  });

  try {
    await EmergencyContact.findOneAndUpdate(
      { userId, phoneKey: key },
      {
        $set: {
          name: user.emergencyName || "Emergency Contact",
          phone: user.emergencyPhone,
          source: "profile",
        },
        $setOnInsert: { relationship: "Emergency Contact" },
      },
      { upsert: true, new: true }
    );
  } catch (e) {
    if (e.code !== 11000) throw e; // parallel-request race, safe to ignore
  }
}

/* =====================================================
   CONTACTS
   ===================================================== */
router.post("/contacts", protect, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name?.trim() || !phone) {
      return res.status(400).json({
        message: "Name and phone number are required",
      });
    }

    const key = phoneKey(phone);

    if (key.length < 9) {
      return res.status(400).json({
        message: "Please enter a valid phone number",
      });
    }

    const exists = await EmergencyContact.findOne({
      userId: req.user._id,
      phoneKey: key,
    });

    if (exists) {
      return res.status(409).json({
        message: `This number is already saved as "${exists.name}".`,
      });
    }

    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name,
      phone,
      phoneKey: key,
      relationship: relationship || "",
      source: "manual",
    });

    res.status(201).json({
      message: "Emergency contact added successfully",
      contact,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This number is already saved.",
      });
    }

    res.status(500).json({
      message: "Failed to add emergency contact",
      error: error.message,
    });
  }
});

router.get("/contacts", protect, async (req, res) => {
  try {
    await syncProfileContact(req.user._id);

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

    if (contact.source === "profile") {
      return res.status(400).json({
        message: "This contact comes from your Profile. Edit it there.",
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

/* =====================================================
   LIVE LOCATION SHARING
   ===================================================== */
const SHARE_HOURS = 4;

router.post("/location/start", protect, async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "Valid coordinates are required" });
    }

    const expiresAt = new Date(Date.now() + SHARE_HOURS * 3600 * 1000);

    let share = await LocationShare.findOne({
      user: req.user._id,
      active: true,
      expiresAt: { $gt: new Date() },
    });

    if (share) {
      share.lat = lat;
      share.lng = lng;
      share.accuracy = accuracy;
      share.expiresAt = expiresAt;
      share.updatedAt = new Date();
    } else {
      share = new LocationShare({
        user: req.user._id,
        token: crypto.randomBytes(16).toString("hex"),
        lat,
        lng,
        accuracy,
        expiresAt,
      });
    }

    await share.save();

    res.status(200).json({ token: share.token, expiresAt });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start location sharing",
      error: error.message,
    });
  }
});

router.put("/location/update", protect, async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;

    const share = await LocationShare.findOneAndUpdate(
      { user: req.user._id, active: true },
      { lat, lng, accuracy, updatedAt: new Date() },
      { new: true }
    );

    if (!share) {
      return res.status(404).json({ message: "No active location share" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update location",
      error: error.message,
    });
  }
});

router.post("/location/stop", protect, async (req, res) => {
  try {
    await LocationShare.updateMany(
      { user: req.user._id, active: true },
      { active: false }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to stop location sharing",
      error: error.message,
    });
  }
});

// PUBLIC: no login needed, the contact opens this through the shared link
router.get("/track/:token", async (req, res) => {
  try {
    const share = await LocationShare.findOne({
      token: req.params.token,
    }).populate("user", "name");

    if (!share || share.expiresAt < new Date()) {
      return res.status(404).json({ message: "This link has expired." });
    }

    res.status(200).json({
      name: share.user?.name?.split(" ")[0] || "Your contact",
      lat: share.lat,
      lng: share.lng,
      accuracy: share.accuracy,
      active: share.active,
      updatedAt: share.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load location" });
  }
});

module.exports = router;