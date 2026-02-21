const express = require("express");
const router = express.Router();
const { getUserProfile, updateFarmProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/profile/me
router.get("/me", protect, getUserProfile);

// PUT /api/profile/farm
router.put("/farm", protect, updateFarmProfile);

module.exports = router;