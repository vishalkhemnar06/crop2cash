const User = require("../models/User");
const FarmProfile = require("../models/FarmProfile");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    let farmProfile = await FarmProfile.findOne({ userId: req.user.id });
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
    const {
      cropType, customCropType,
      landArea,
      soilType, irrigationType,
      equipment, customEquipment,
      season,
      budgetRange, customBudget,
    } = req.body;

    const allowedUpdates = {
      cropType, customCropType,
      landArea,
      soilType, irrigationType,
      equipment, customEquipment,
      season,
      budgetRange, customBudget,
    };

    // Remove undefined keys
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Validate land area minimum
    if (allowedUpdates.landArea !== undefined && allowedUpdates.landArea < 0.1) {
      return res.status(400).json({ message: "Land area must be at least 0.1 acres" });
    }

    const updatedProfile = await FarmProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: allowedUpdates },
      { returnDocument: "after", upsert: true }
    );

    res.json(updatedProfile);
  } catch (error) {
    console.error("❌ updateFarmProfile Error:", error);
    res.status(500).json({ message: error.message });
  }
};