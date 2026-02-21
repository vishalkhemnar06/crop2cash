const express = require("express");
const router = express.Router();
const { analyzeFarm } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/ai/analyze
router.post("/analyze", protect, analyzeFarm);

module.exports = router;