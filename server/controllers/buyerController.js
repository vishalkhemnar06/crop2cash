const User = require("../models/User");
const BuyerProfile = require("../models/BuyerProfile");
const ResiduePost = require("../models/ResiduePost");

// ── Haversine distance (km) ───────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── GET buyer's own profile ───────────────────────────────────────
exports.getMyBuyerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await BuyerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await BuyerProfile.create({ userId: req.user.id });
    }

    res.json({ user, buyerProfile: profile });
  } catch (err) {
    console.error("❌ getMyBuyerProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE buyer profile ──────────────────────────────────────────
exports.updateBuyerProfile = async (req, res) => {
  try {
    const {
      materialTypes, pricePerTon, minQuantity, maxQuantity,
      maxDistanceKm, pickupAvailable, paymentTerms,
      businessName, businessType, workingDays, contactPerson,
      description, isActive,
    } = req.body;

    const updates = {
      materialTypes, pricePerTon, minQuantity, maxQuantity,
      maxDistanceKm, pickupAvailable, paymentTerms,
      businessName, businessType, workingDays, contactPerson,
      description, isActive,
    };
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const profile = await BuyerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error("❌ updateBuyerProfile:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET all buyers (for farmer map / search) ─────────────────────
exports.getAllBuyers = async (req, res) => {
  try {
    const { lat, lng, radius = 100, materialType } = req.query;

    let profiles = await BuyerProfile.find({ isActive: true });

    const userIds = profiles.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds }, isActive: true }).select("-passwordHash");
    const userMap = {};
    users.forEach((u) => (userMap[String(u._id)] = u));

    let results = profiles
      .map((p) => {
        const u = userMap[String(p.userId)];
        if (!u) return null;
        return {
          buyerId: u._id,
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          location: u.location,
          buyerProfile: p,
          distanceKm: null,
        };
      })
      .filter(Boolean);

    if (materialType && materialType !== "All") {
      results = results.filter(
        (r) =>
          r.buyerProfile.materialTypes.includes(materialType) ||
          r.buyerProfile.materialTypes.includes("Any")
      );
    }

    if (lat && lng) {
      const fLat = parseFloat(lat);
      const fLng = parseFloat(lng);
      const maxR = parseFloat(radius);

      results = results
        .map((r) => {
          const bLat = r.location?.lat;
          const bLng = r.location?.lng;
          if (bLat && bLng) {
            r.distanceKm = Math.round(haversineKm(fLat, fLng, bLat, bLng) * 10) / 10;
          }
          return r;
        })
        .filter((r) => {
          if (!r.distanceKm) return true;
          return r.distanceKm <= maxR && r.distanceKm <= (r.buyerProfile.maxDistanceKm || 9999);
        });

      results.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    res.json(results);
  } catch (err) {
    console.error("❌ getAllBuyers:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET nearby farmers (for buyer map) ───────────────────────────
exports.getNearbyFarmers = async (req, res) => {
  try {
    const { lat, lng, radius = 150 } = req.query;

    // Get all active residue posts with farmer info
    const posts = await ResiduePost.find({ status: "active" })
      .populate("farmerId", "fullName phoneNumber location state district")
      .sort({ createdAt: -1 })
      .limit(100);

    let results = posts
      .map((post) => {
        const farmer = post.farmerId;
        if (!farmer) return null;

        const fLat = farmer.location?.lat || null;
        const fLng = farmer.location?.lng || null;

        return {
          farmerId: farmer._id,
          fullName: farmer.fullName,
          phoneNumber: farmer.phoneNumber,
          location: farmer.location || { state: farmer.state, district: farmer.district },
          post: {
            _id: post._id,
            cropType: post.cropType,
            residueType: post.residueType,
            estimatedQuantity: post.estimatedQuantity,
            pricePerTon: post.pricePerTon,
            bestMethod: post.bestMethod,
            estimatedProfit: post.estimatedProfit,
            roiPercent: post.roiPercent,
            season: post.season,
            status: post.status,
            contactPhone: post.contactPhone,
            createdAt: post.createdAt,
          },
          distanceKm: null,
        };
      })
      .filter(Boolean);

    // Distance filter if buyer has GPS
    if (lat && lng) {
      const bLat = parseFloat(lat);
      const bLng = parseFloat(lng);
      const maxR = parseFloat(radius);

      results = results
        .map((r) => {
          const fLat = r.location?.lat;
          const fLng = r.location?.lng;
          if (fLat && fLng) {
            r.distanceKm = Math.round(haversineKm(bLat, bLng, fLat, fLng) * 10) / 10;
          }
          return r;
        })
        .filter((r) => !r.distanceKm || r.distanceKm <= maxR);

      results.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    // Deduplicate by farmerId (show each farmer once with their latest post)
    const seen = new Set();
    results = results.filter((r) => {
      const key = String(r.farmerId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json(results);
  } catch (err) {
    console.error("❌ getNearbyFarmers:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── MATCH buyers to a specific residue post ──────────────────────
exports.matchBuyersToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await ResiduePost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const fLat = post.location?.lat;
    const fLng = post.location?.lng;
    const qty = post.estimatedQuantity;

    let profiles = await BuyerProfile.find({ isActive: true });

    const userIds = profiles.map((p) => p.userId);
    const users = await User.find({ _id: { $in: userIds }, isActive: true }).select("-passwordHash");
    const userMap = {};
    users.forEach((u) => (userMap[String(u._id)] = u));

    let results = profiles
      .map((p) => {
        const u = userMap[String(p.userId)];
        if (!u) return null;

        const typeMatch =
          p.materialTypes.includes(post.residueType) ||
          p.materialTypes.includes("Any") ||
          p.materialTypes.length === 0;

        const qtyMatch = !p.minQuantity || qty >= p.minQuantity;

        if (!typeMatch || !qtyMatch) return null;

        let distKm = null;
        if (fLat && fLng && u.location?.lat && u.location?.lng) {
          distKm = Math.round(haversineKm(fLat, fLng, u.location.lat, u.location.lng) * 10) / 10;
          if (distKm > (p.maxDistanceKm || 9999)) return null;
        }

        const dynamicIncome = p.pricePerTon ? qty * p.pricePerTon : null;

        return {
          buyerId: u._id,
          fullName: u.fullName,
          phoneNumber: u.phoneNumber,
          location: u.location,
          buyerProfile: p,
          distanceKm: distKm,
          dynamicIncome,
          score: (p.pricePerTon || 0) * 2 - (distKm || 50) + (p.pickupAvailable ? 20 : 0),
        };
      })
      .filter(Boolean);

    results.sort((a, b) => b.score - a.score);

    res.json(results.slice(0, 10));
  } catch (err) {
    console.error("❌ matchBuyersToPost:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET requests (farmer interest) received by buyer ────────────
exports.getBuyerRequests = async (req, res) => {
  try {
    const posts = await ResiduePost.find({
      "interestedBuyers.buyerId": req.user.id,
      status: "active",
    }).populate("farmerId", "fullName phoneNumber location");

    const result = posts.map((p) => {
      const myInterest = p.interestedBuyers.find(
        (b) => String(b.buyerId) === String(req.user.id)
      );
      return { post: p, myInterest };
    });

    res.json(result);
  } catch (err) {
    console.error("❌ getBuyerRequests:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET all active residue posts (buyer sees farmer listings) ───
exports.getAllResiduePosts = async (req, res) => {
  try {
    const { lat, lng, radius = 200, materialType } = req.query;

    const query = { status: "active" };
    if (materialType && materialType !== "All") {
      query.residueType = { $regex: materialType, $options: "i" };
    }

    const posts = await ResiduePost.find(query)
      .populate("farmerId", "fullName phoneNumber location")
      .sort({ createdAt: -1 })
      .limit(50);

    let results = posts.map((p) => {
      let distKm = null;
      if (lat && lng && p.location?.lat && p.location?.lng) {
        distKm = Math.round(
          haversineKm(parseFloat(lat), parseFloat(lng), p.location.lat, p.location.lng) * 10
        ) / 10;
      }
      return { ...p.toObject(), distanceKm: distKm };
    });

    if (lat && lng) {
      const maxR = parseFloat(radius);
      results = results.filter((r) => !r.distanceKm || r.distanceKm <= maxR);
      results.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    res.json(results);
  } catch (err) {
    console.error("❌ getAllResiduePosts:", err);
    res.status(500).json({ message: err.message });
  }
};