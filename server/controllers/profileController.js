const User = require("../models/User");
const FarmProfile = require("../models/FarmProfile");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    // ✅ FIX 1: Handle case where user no longer exists in DB
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let farmProfile = await FarmProfile.findOne({ userId: req.user.id });

    // Create an empty profile if it doesn't exist yet (farmers only)
    if (!farmProfile && user.role === "farmer") {
      farmProfile = await FarmProfile.create({ userId: req.user.id });
    }

    res.json({ user, farmProfile: farmProfile || null });
  } catch (error) {
    console.error("❌ getUserProfile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateFarmProfile = async (req, res) => {
  try {
    // ✅ FIX 2: Only allow whitelisted fields to be updated (prevent arbitrary DB writes)
    const { cropType, landArea, soilType, irrigationType, equipment, season, budgetRange } = req.body;

    const allowedUpdates = { cropType, landArea, soilType, irrigationType, equipment, season, budgetRange };

    // Remove undefined keys so we don't overwrite existing data with undefined
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const updatedProfile = await FarmProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: allowedUpdates },
      { returnDocument: 'after', upsert: true }
    );

    res.json(updatedProfile);
  } catch (error) {
    console.error("❌ updateFarmProfile Error:", error);
    res.status(500).json({ message: error.message });
  }
};