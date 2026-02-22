

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


exports.updateUserSettings = async (req, res) => {
  try {
    const { fullName, phoneVisible, emailNotifications, smsNotifications, preferredContact } = req.body;


    const allowed = { };
    if (fullName !== undefined) allowed.fullName = fullName;
    if (phoneVisible !== undefined) allowed.phoneVisible = !!phoneVisible;
    if (emailNotifications !== undefined) allowed.emailNotifications = !!emailNotifications;
    if (smsNotifications !== undefined) allowed.smsNotifications = !!smsNotifications;
    if (preferredContact !== undefined) allowed.preferredContact = preferredContact;


    const updated = await User.findByIdAndUpdate(req.user.id, { $set: allowed }, { new: true }).select("-passwordHash");
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ user: updated });
  } catch (error) {
    console.error("❌ updateUserSettings Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update user profile (identified by phoneNumber) and optional password
exports.updateUserProfile = async (req, res) => {
  try {
    const { phoneNumber, fullName, state, district, taluka, localAddress, pincode, newPassword, confirmPassword } = req.body;


    if (!phoneNumber) return res.status(400).json({ message: "phoneNumber is required" });


    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });


    // Ensure the authenticated user matches the phoneNumber
    if (String(user._id) !== String(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }


    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (state !== undefined) updates['location.state'] = state;
    if (district !== undefined) updates['location.district'] = district;
    if (taluka !== undefined) updates['location.taluka'] = taluka;
    if (localAddress !== undefined) updates['location.localAddress'] = localAddress;
    if (pincode !== undefined) updates['location.pincode'] = pincode;


    // If password change requested
    if (newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) return res.status(400).json({ message: "Both password fields are required" });
      if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
      if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      const hashed = await require('bcryptjs').hash(newPassword, 10);
      updates.passwordHash = hashed;
    }


    // Apply updates
    const updated = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true }).select('-passwordHash');
    res.json({ user: updated });
  } catch (error) {
    console.error("❌ updateUserProfile Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// Delete user account (and farm profile)
exports.deleteAccount = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "phoneNumber is required" });


    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user._id) !== String(req.user.id)) return res.status(403).json({ message: "Unauthorized" });


    // Remove farm profile if exists
    const FarmProfile = require('../models/FarmProfile');
    await FarmProfile.deleteOne({ userId: user._id });
    // TODO: optionally delete posts, buyer profiles, etc.


    await User.deleteOne({ _id: user._id });


    // Clear client tokens if needed (client should logout)
    res.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('❌ deleteAccount Error:', error);
    res.status(500).json({ message: error.message });
  }
};


