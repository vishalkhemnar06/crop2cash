const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { analyzeFarm, estimateResidueFromImages } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// Multer config — store images locally in /uploads
// ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // e.g. residue-1714000000000-field1.jpg
    const uniqueName = `residue-${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
});

// POST /api/ai/analyze — text-based farm analysis
router.post("/analyze", protect, analyzeFarm);

// POST /api/ai/estimate-residue — image-based residue estimation
// up to 5 images at once
router.post("/estimate-residue", protect, upload.array("images", 5), estimateResidueFromImages);

module.exports = router;