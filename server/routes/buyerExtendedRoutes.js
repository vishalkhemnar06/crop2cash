const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  toggleFavoriteFarmer,
  toggleFavoritePost,
  getMyFavorites,
  getFavoriteIds,
  updateFavoriteNote,
} = require("../controllers/favoritesController");

const {
  createDeal,
  getMyDeals,
  updateDeal,
  deleteDeal,
  getBuyerAnalytics,
  getPriceTrends,
} = require("../controllers/analyticsController");

const {
  createLogisticsRequest,
  getMyLogistics,
  updateLogisticsStatus,
  deleteLogisticsRequest,
  estimateCost,
} = require("../controllers/logisticsController");

// ── Favorites ─────────────────────────────────────────────────────
router.get("/favorites",                 protect, getMyFavorites);
router.get("/favorites/ids",             protect, getFavoriteIds);
router.post("/favorites/farmer/:farmerId", protect, toggleFavoriteFarmer);
router.post("/favorites/post/:postId",   protect, toggleFavoritePost);
router.put("/favorites/:id/note",        protect, updateFavoriteNote);

// ── Analytics / Deals ─────────────────────────────────────────────
router.get ("/analytics",               protect, getBuyerAnalytics);
router.get ("/analytics/price-trends",  protect, getPriceTrends);
router.get ("/deals",                   protect, getMyDeals);
router.post("/deals",                   protect, createDeal);
router.put ("/deals/:id",              protect, updateDeal);
router.delete("/deals/:id",            protect, deleteDeal);

// ── Logistics ─────────────────────────────────────────────────────
router.get ("/logistics",              protect, getMyLogistics);
router.get ("/logistics/estimate",     protect, estimateCost);
router.post("/logistics",              protect, createLogisticsRequest);
router.put ("/logistics/:id/status",   protect, updateLogisticsStatus);
router.delete("/logistics/:id",        protect, deleteLogisticsRequest);

module.exports = router;