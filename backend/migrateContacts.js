const EmergencyContact = require("../models/EmergencyContact");
const { phoneKey } = require("../utils/phone");

/* ---------- copy the Profile emergency contact into the contacts list ---------- */
async function syncProfileContact(userId) {
  const user = await User.findById(userId).select("emergencyName emergencyPhone");
  const key = phoneKey(user?.emergencyPhone);

  if (!key || key.length < 9) {
    await EmergencyContact.deleteMany({ userId, source: "profile" });
    return;
  }

  // phone changed in profile -> remove old profile-linked copy
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

/* ---------- contacts ---------- */
router.get("/contacts", protect, async (req, res) => {
  try {
    await syncProfileContact(req.user._id);
    const contacts = await EmergencyContact.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load contacts." });
  }
});

router.post("/contacts", protect, async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;
    const key = phoneKey(phone);

    if (!name?.trim() || key.length < 9) {
      return res.status(400).json({ message: "Enter a valid name and phone number." });
    }

    const exists = await EmergencyContact.findOne({ userId: req.user._id, phoneKey: key });
    if (exists) {
      return res.status(409).json({ message: `This number is already saved as "${exists.name}".` });
    }

    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name,
      phone,
      phoneKey: key,
      relationship: relationship || "",
      source: "manual",
    });

    res.status(201).json(contact);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This number is already saved." });
    }
    console.error(err);
    res.status(500).json({ message: "Failed to add contact." });
  }
});

router.delete("/contacts/:id", protect, async (req, res) => {
  try {
    const c = await EmergencyContact.findOne({ _id: req.params.id, userId: req.user._id });
    if (!c) return res.status(404).json({ message: "Contact not found." });

    if (c.source === "profile") {
      return res.status(400).json({ message: "Edit this contact from your Profile page." });
    }

    await c.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete contact." });
  }
});