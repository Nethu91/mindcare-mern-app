// GET /auth/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// PUT /auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      name,
      phone,
      city,
      age,
      gender,
      nickname,
      bio,
      photo,
      avatarHair,
      avatarHairColor,
      avatarSkin,
      avatarGlasses,
      avatarBg,
    } = req.body;

    const update = {
      name,
      phone,
      city,
      age,
      gender,
      nickname,
      bio,
      photo,
      avatarHair,
      avatarHairColor,
      avatarSkin,
      avatarGlasses,
      avatarBg,
    };

    // Remove only undefined fields. photo = "" is kept, so removing
    // a photo is saved to the database too.
    Object.keys(update).forEach((key) => {
      if (update[key] === undefined) delete update[key];
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};