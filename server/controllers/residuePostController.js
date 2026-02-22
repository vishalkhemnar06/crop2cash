const ResiduePost = require("../models/ResiduePost");
const User = require("../models/User");

// ── CREATE post ───────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "farmer") return res.status(403).json({ message: "Only farmers can post residue" });

    const {
      cropType, season, residueType, estimatedQuantity, pricePerTon,
      availableFrom, bestMethod, estimatedProfit, roiPercent, biomassValue,
      contactPhone, contactMessage,
    } = req.body;

    if (!cropType || !estimatedQuantity) {
      return res.status(400).json({ message: "cropType and estimatedQuantity are required" });
    }

    const post = await ResiduePost.create({
      farmerId: req.user.id,
      cropType,
      season: season || "",
      residueType: residueType || "",
      estimatedQuantity: parseFloat(estimatedQuantity),
      pricePerTon: pricePerTon ? parseFloat(pricePerTon) : null,
      availableFrom: availableFrom || new Date(),
      bestMethod: bestMethod || "",
      estimatedProfit: estimatedProfit || "",
      roiPercent: roiPercent ? parseFloat(roiPercent) : null,
      biomassValue: biomassValue || "",
      location: {
        state:    user.location?.state    || user.state    || "",
        district: user.location?.district || user.district || "",
        pincode:  user.location?.pincode  || "",
        lat:      user.location?.lat      || null,
        lng:      user.location?.lng      || null,
      },
      contactPhone:   contactPhone   || user.phoneNumber,
      contactMessage: contactMessage || "",
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("❌ createPost:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET farmer's own posts ────────────────────────────────────────
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await ResiduePost.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE post status ────────────────────────────────────────────
exports.updatePost = async (req, res) => {
  try {
    const post = await ResiduePost.findOne({ _id: req.params.id, farmerId: req.user.id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const allowed = ["status", "pricePerTon", "estimatedQuantity", "contactMessage"];
    allowed.forEach((k) => { if (req.body[k] !== undefined) post[k] = req.body[k]; });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE post ───────────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    await ResiduePost.findOneAndDelete({ _id: req.params.id, farmerId: req.user.id });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── BUYER shows interest in a post ───────────────────────────────
exports.showInterest = async (req, res) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;

    const buyer = await User.findById(req.user.id).select("-passwordHash");
    if (!buyer || buyer.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can show interest" });
    }

    const post = await ResiduePost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Prevent duplicate interest
    const alreadyInterested = post.interestedBuyers.some(
      (b) => String(b.buyerId) === String(req.user.id)
    );
    if (alreadyInterested) {
      return res.status(400).json({ message: "You have already shown interest in this post" });
    }

    post.interestedBuyers.push({
      buyerId: req.user.id,
      name:    buyer.fullName,
      phone:   buyer.phoneNumber,
      message: message || "",
    });
    await post.save();

    res.json({ message: "Interest registered successfully" });
  } catch (err) {
    console.error("❌ showInterest:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET single post with interested buyers (farmer sees) ─────────
exports.getPostWithInterest = async (req, res) => {
  try {
    const post = await ResiduePost.findOne({
      _id: req.params.id,
      farmerId: req.user.id,
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET all active posts (public, for marketplace) ────────────────
exports.getAllActivePosts = async (req, res) => {
  try {
    const posts = await ResiduePost.find({ status: "active" })
      .populate("farmerId", "fullName phoneNumber location district state")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};