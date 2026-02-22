const BuyerDeal = require("../models/BuyerDeal");
const ResiduePost = require("../models/ResiduePost");
const BuyerProfile = require("../models/BuyerProfile");
const User = require("../models/User");

// ── CREATE a deal (buyer logs a completed/confirmed deal) ─────────
exports.createDeal = async (req, res) => {
  try {
    const {
      farmerId, postId, cropType, residueType,
      quantity, pricePerTon, status, dealDate,
      deliveryDate, pickupLocation, deliveryLocation,
      transportMode, transportCost, transportNotes, notes,
    } = req.body;

    if (!cropType || !quantity || !pricePerTon) {
      return res.status(400).json({ message: "cropType, quantity, and pricePerTon are required" });
    }

    const deal = await BuyerDeal.create({
      buyerId: req.user.id,
      farmerId: farmerId || null,
      postId:   postId   || null,
      cropType, residueType,
      quantity:  parseFloat(quantity),
      pricePerTon: parseFloat(pricePerTon),
      status:   status   || "confirmed",
      dealDate: dealDate ? new Date(dealDate) : new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      pickupLocation:   pickupLocation   || "",
      deliveryLocation: deliveryLocation || "",
      transportMode, transportCost, transportNotes, notes,
    });

    res.status(201).json(deal);
  } catch (err) {
    console.error("❌ createDeal:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET all deals for this buyer ──────────────────────────────────
exports.getMyDeals = async (req, res) => {
  try {
    const deals = await BuyerDeal.find({ buyerId: req.user.id })
      .populate("farmerId", "fullName phoneNumber location")
      .populate("postId", "cropType residueType estimatedQuantity")
      .sort({ dealDate: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE deal status ────────────────────────────────────────────
exports.updateDeal = async (req, res) => {
  try {
    const deal = await BuyerDeal.findOneAndUpdate(
      { _id: req.params.id, buyerId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!deal) return res.status(404).json({ message: "Deal not found" });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE deal ───────────────────────────────────────────────────
exports.deleteDeal = async (req, res) => {
  try {
    await BuyerDeal.findOneAndDelete({ _id: req.params.id, buyerId: req.user.id });
    res.json({ message: "Deal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ANALYTICS: full buyer stats from real DB data ─────────────────
exports.getBuyerAnalytics = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const deals = await BuyerDeal.find({ buyerId }).sort({ dealDate: -1 });

    const completedDeals = deals.filter(d => d.status === "completed" || d.status === "confirmed");
    const totalDeals = completedDeals.length;
    const totalTons  = completedDeals.reduce((s, d) => s + (d.quantity || 0), 0);
    const totalSpent = completedDeals.reduce((s, d) => s + (d.totalAmount || 0), 0);
    const totalCO2   = completedDeals.reduce((s, d) => s + (d.co2SavedKg || 0), 0);
    const avgPrice   = totalTons > 0
      ? Math.round(completedDeals.reduce((s, d) => s + (d.pricePerTon || 0), 0) / completedDeals.length)
      : 0;

    // Breakdown by crop type
    const cropBreakdown = {};
    completedDeals.forEach(d => {
      if (!cropBreakdown[d.cropType]) cropBreakdown[d.cropType] = { deals: 0, tons: 0, spent: 0 };
      cropBreakdown[d.cropType].deals++;
      cropBreakdown[d.cropType].tons  += d.quantity || 0;
      cropBreakdown[d.cropType].spent += d.totalAmount || 0;
    });

    // Monthly deal trend (last 6 months)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      const monthDeals = completedDeals.filter(deal => {
        const dd = new Date(deal.dealDate);
        return dd.getFullYear() === d.getFullYear() && dd.getMonth() === d.getMonth();
      });
      months.push({
        label,
        deals:    monthDeals.length,
        tons:     Math.round(monthDeals.reduce((s, d) => s + (d.quantity || 0), 0) * 10) / 10,
        spent:    monthDeals.reduce((s, d) => s + (d.totalAmount || 0), 0),
        avgPrice: monthDeals.length > 0
          ? Math.round(monthDeals.reduce((s, d) => s + (d.pricePerTon || 0), 0) / monthDeals.length)
          : null,
      });
    }

    res.json({
      totalDeals,
      totalTons:  Math.round(totalTons * 10) / 10,
      totalSpent,
      avgPrice,
      co2SavedKg: totalCO2,
      co2SavedTon: Math.round(totalCO2 / 100) / 10,
      cropBreakdown,
      monthlyTrend: months,
      recentDeals:  deals.slice(0, 5),
    });
  } catch (err) {
    console.error("❌ getBuyerAnalytics:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── PRICE TRENDS: compute from real ResiduePost data ─────────────
exports.getPriceTrends = async (req, res) => {
  try {
    const { cropType } = req.query;

    // Last 6 months of active + sold posts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const query = {
      createdAt: { $gte: sixMonthsAgo },
      pricePerTon: { $ne: null, $gt: 0 },
    };
    if (cropType && cropType !== "All") {
      query.cropType = { $regex: cropType, $options: "i" };
    }

    const posts = await ResiduePost.find(query).select("cropType residueType pricePerTon createdAt status");

    // Group by month
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });

      const monthPosts = posts.filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
      });

      const prices = monthPosts.map(p => p.pricePerTon).filter(Boolean);
      const avg    = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
      const min    = prices.length > 0 ? Math.min(...prices) : null;
      const max    = prices.length > 0 ? Math.max(...prices) : null;

      months.push({ label, avgPrice: avg, minPrice: min, maxPrice: max, postCount: monthPosts.length });
    }

    // Current month summary
    const currentPosts = posts.filter(p => {
      const pd = new Date(p.createdAt);
      return pd.getFullYear() === now.getFullYear() && pd.getMonth() === now.getMonth();
    });
    const currentPrices = currentPosts.map(p => p.pricePerTon).filter(Boolean);
    const currentAvg = currentPrices.length > 0
      ? Math.round(currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length)
      : null;

    // 6-month overall average
    const allPrices = posts.map(p => p.pricePerTon).filter(Boolean);
    const sixMonthAvg = allPrices.length > 0
      ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
      : null;

    // Trend direction: compare last month vs prev month
    const lastTwo = months.filter(m => m.avgPrice !== null).slice(-2);
    let trend = "stable";
    if (lastTwo.length === 2) {
      const diff = lastTwo[1].avgPrice - lastTwo[0].avgPrice;
      if (diff > 100) trend = "rising";
      else if (diff < -100) trend = "falling";
    }

    // Price level vs average
    let priceLevel = "Normal";
    if (currentAvg && sixMonthAvg) {
      const pct = ((currentAvg - sixMonthAvg) / sixMonthAvg) * 100;
      if (pct > 10) priceLevel = "High";
      else if (pct < -10) priceLevel = "Low";
    }

    // Crop type breakdown — which crops have most listings
    const cropCounts = {};
    posts.forEach(p => {
      cropCounts[p.cropType] = (cropCounts[p.cropType] || 0) + 1;
    });

    const cropSummary = Object.entries(cropCounts)
      .map(([crop, count]) => {
        const cropPosts = posts.filter(p => p.cropType === crop);
        const cropPrices = cropPosts.map(p => p.pricePerTon).filter(Boolean);
        return {
          crop,
          count,
          avgPrice: cropPrices.length > 0
            ? Math.round(cropPrices.reduce((a, b) => a + b, 0) / cropPrices.length)
            : null,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.json({
      months,
      currentAvg,
      sixMonthAvg,
      trend,
      priceLevel,
      totalPostsAnalyzed: posts.length,
      cropSummary,
    });
  } catch (err) {
    console.error("❌ getPriceTrends:", err);
    res.status(500).json({ message: err.message });
  }
};