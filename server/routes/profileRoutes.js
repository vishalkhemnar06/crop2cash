const express = require("express");
const router = express.Router();
const { getUserProfile, updateFarmProfile, updateUserSettings, updateUserProfile, deleteAccount } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");


// GET /api/profile/me
router.get("/me", protect, getUserProfile);


// PUT /api/profile/farm
router.put("/farm", protect, updateFarmProfile);


// PUT /api/profile/settings
router.put("/settings", protect, updateUserSettings);


// PUT /api/profile/update — update profile and optional password (identify by phoneNumber)
router.put("/update", protect, updateUserProfile);


// DELETE /api/profile/delete — delete account (identify by phoneNumber)
router.delete("/delete", protect, deleteAccount);


module.exports = router;


