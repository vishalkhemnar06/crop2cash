const BuyerFavorite = require("../models/BuyerFavorite");
const User = require("../models/User");
const ResiduePost = require("../models/ResiduePost");

// ── Toggle favorite farmer ────────────────────────────────────────
exports.toggleFavoriteFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
     const { note } = req.body || {}; 

    const farmer = await User.findById(farmerId).select("fullName location");
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });

    const existing = await BuyerFavorite.findOne({
      buyerId: req.user.id,
      type: "farmer",
      farmerId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false, message: "Removed from favorites" });
    }

    const fav = await BuyerFavorite.create({
      buyerId: req.user.id,
      type: "farmer",
      farmerId,
      label: farmer.fullName,
      note: note || "",
    });

    res.status(201).json({ saved: true, favorite: fav, message: "Added to favorites" });
  } catch (err) {
    console.error("❌ toggleFavoriteFarmer:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Toggle favorite post ──────────────────────────────────────────
exports.toggleFavoritePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { note } = req.body;

    const post = await ResiduePost.findById(postId).select("cropType residueType estimatedQuantity pricePerTon");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await BuyerFavorite.findOne({
      buyerId: req.user.id,
      type: "post",
      postId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false, message: "Removed from saved posts" });
    }

    const label = `${post.cropType}${post.residueType ? " – " + post.residueType : ""} (${post.estimatedQuantity}T)`;

    const fav = await BuyerFavorite.create({
      buyerId: req.user.id,
      type: "post",
      postId,
      label,
      note: note || "",
    });

    res.status(201).json({ saved: true, favorite: fav, message: "Post saved to favorites" });
  } catch (err) {
    console.error("❌ toggleFavoritePost:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Get all favorites ─────────────────────────────────────────────
exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await BuyerFavorite.find({ buyerId: req.user.id })
      .sort({ createdAt: -1 });

    // Enrich farmer favorites
    const farmerFavs = favorites.filter(f => f.type === "farmer" && f.farmerId);
    const postFavs   = favorites.filter(f => f.type === "post"   && f.postId);

    const farmerIds = farmerFavs.map(f => f.farmerId);
    const postIds   = postFavs.map(f => f.postId);

    const [farmers, posts] = await Promise.all([
      User.find({ _id: { $in: farmerIds } }).select("-passwordHash"),
      ResiduePost.find({ _id: { $in: postIds } }).populate("farmerId", "fullName phoneNumber location"),
    ]);

    const farmerMap = {};
    farmers.forEach(f => (farmerMap[String(f._id)] = f));

    const postMap = {};
    posts.forEach(p => (postMap[String(p._id)] = p));

    const enriched = favorites.map(fav => {
      if (fav.type === "farmer") {
        return { ...fav.toObject(), farmer: farmerMap[String(fav.farmerId)] || null };
      }
      return { ...fav.toObject(), post: postMap[String(fav.postId)] || null };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ getMyFavorites:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── Get favorite IDs (for UI to know which are starred) ──────────
exports.getFavoriteIds = async (req, res) => {
  try {
    const favorites = await BuyerFavorite.find({ buyerId: req.user.id }).select("type farmerId postId");
    const farmerIds = favorites.filter(f => f.type === "farmer").map(f => String(f.farmerId));
    const postIds   = favorites.filter(f => f.type === "post").map(f => String(f.postId));
    res.json({ farmerIds, postIds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update note on a favorite ─────────────────────────────────────
exports.updateFavoriteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const fav = await BuyerFavorite.findOneAndUpdate(
      { _id: id, buyerId: req.user.id },
      { note },
      { new: true }
    );
    if (!fav) return res.status(404).json({ message: "Favorite not found" });
    res.json(fav);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};