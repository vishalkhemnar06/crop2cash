const express = require("express");
const router = express.Router();
const {
  createPost,
  getMyPosts,
  updatePost,
  deletePost,
  showInterest,
  getPostWithInterest,
  getAllActivePosts,
} = require("../controllers/residuePostController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createPost);
router.get("/mine", protect, getMyPosts);
router.get("/all", protect, getAllActivePosts);
router.get("/:id", protect, getPostWithInterest);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:postId/interest", protect, showInterest);

module.exports = router;