const express = require("express");
const router = express.Router();
const {
  getMyBuyerProfile,
  updateBuyerProfile,
  getAllBuyers,
  getNearbyFarmers,
  matchBuyersToPost,
  getBuyerRequests,
  getAllResiduePosts,
} = require("../controllers/buyerController");
const { protect } = require("../middleware/authMiddleware");

// Buyer profile
router.get("/profile/me",      protect, getMyBuyerProfile);
router.put("/profile/update",  protect, updateBuyerProfile);

// Discovery
router.get("/all",             protect, getAllBuyers);            // farmer finds buyers
router.get("/nearby-farmers",  protect, getNearbyFarmers);       // buyer finds nearby farmers
router.get("/match/:postId",   protect, matchBuyersToPost);      // match buyers to a post
router.get("/requests",        protect, getBuyerRequests);       // buyer sees requests
router.get("/posts/all",       protect, getAllResiduePosts);      // buyer sees all farmer posts

module.exports = router;