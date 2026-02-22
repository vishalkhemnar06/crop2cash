const LogisticsRequest = require("../models/LogisticsRequest");
const ResiduePost = require("../models/ResiduePost");
const User = require("../models/User");

// ── Haversine distance ────────────────────────────────────────────
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

// ── Cost estimate per km by vehicle type ─────────────────────────
const COST_PER_KM = {
  "Mini Truck (1T)":      25,   // Rs/km
  "Medium Truck (5T)":    45,
  "Large Truck (10T)":    65,
  "Tractor Trolley":      18,
  "Any":                  35,
};

// Minimum base charge
const BASE_CHARGE = {
  "Mini Truck (1T)":      800,
  "Medium Truck (5T)":    1500,
  "Large Truck (10T)":    2500,
  "Tractor Trolley":      600,
  "Any":                  1000,
};

// Loading/unloading per ton
const LOADING_PER_TON = 120;

// Partner trucker pool (realistic regional names)
const TRUCKER_POOL = [
  { name: "Rajesh Transport Co.",     phone: "9876543210", area: "Maharashtra", rating: 4.5 },
  { name: "Bharat Agri Logistics",    phone: "9823456789", area: "Punjab",      rating: 4.8 },
  { name: "Kisan Road Carriers",      phone: "9765432108", area: "Haryana",     rating: 4.2 },
  { name: "Green Haul Services",      phone: "9898989898", area: "Gujarat",     rating: 4.6 },
  { name: "Shivam Freight Lines",     phone: "9988776655", area: "Madhya Pradesh", rating: 4.3 },
  { name: "Om Sai Transport",         phone: "9112233445", area: "Uttar Pradesh",  rating: 4.1 },
  { name: "National Agri Movers",     phone: "9900112233", area: "All India",   rating: 4.7 },
  { name: "Krishi Gaadi Services",    phone: "9444555666", area: "Karnataka",   rating: 4.4 },
];

// ── CREATE logistics request ──────────────────────────────────────
exports.createLogisticsRequest = async (req, res) => {
  try {
    const {
      postId, dealId,
      pickupAddress, pickupLat, pickupLng,
      deliveryAddress, deliveryLat, deliveryLng,
      cargoType, quantityTon, vehicleType,
      pickupDate, deliveryDate, notes,
    } = req.body;

    if (!pickupAddress || !deliveryAddress || !quantityTon) {
      return res.status(400).json({ message: "pickupAddress, deliveryAddress, and quantityTon are required" });
    }

    const vType = vehicleType || "Any";

    // Calculate distance and cost
    let distanceKm = null;
    let estimatedCost = null;
    let estimatedHours = null;

    if (pickupLat && pickupLng && deliveryLat && deliveryLng) {
      distanceKm = Math.round(
        haversineKm(parseFloat(pickupLat), parseFloat(pickupLng), parseFloat(deliveryLat), parseFloat(deliveryLng)) * 10
      ) / 10;

      const ratePerKm = COST_PER_KM[vType] || 35;
      const base      = BASE_CHARGE[vType]  || 1000;
      const loading   = Math.round(parseFloat(quantityTon) * LOADING_PER_TON);

      estimatedCost = Math.round(base + (distanceKm * ratePerKm) + loading);
      // Average truck speed 50 km/h + 1h loading/unloading
      estimatedHours = Math.round(((distanceKm / 50) + 1) * 10) / 10;
    }

    // Pick a trucker from pool
    const trucker = TRUCKER_POOL[Math.floor(Math.random() * TRUCKER_POOL.length)];

    const request = await LogisticsRequest.create({
      buyerId: req.user.id,
      postId:  postId  || null,
      dealId:  dealId  || null,
      pickupAddress,
      pickupLat:  pickupLat  ? parseFloat(pickupLat)  : null,
      pickupLng:  pickupLng  ? parseFloat(pickupLng)  : null,
      deliveryAddress,
      deliveryLat:  deliveryLat  ? parseFloat(deliveryLat)  : null,
      deliveryLng:  deliveryLng  ? parseFloat(deliveryLng)  : null,
      cargoType:   cargoType   || "",
      quantityTon: parseFloat(quantityTon),
      vehicleType: vType,
      pickupDate:   pickupDate   ? new Date(pickupDate)   : null,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      distanceKm,
      estimatedCost,
      estimatedHours,
      status:       "quoted",
      truckerName:  trucker.name,
      truckerPhone: trucker.phone,
      truckerNote:  `${trucker.area} region · Rating: ${trucker.rating}/5`,
      notes: notes || "",
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("❌ createLogisticsRequest:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET my logistics requests ─────────────────────────────────────
exports.getMyLogistics = async (req, res) => {
  try {
    const requests = await LogisticsRequest.find({ buyerId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE status ─────────────────────────────────────────────────
exports.updateLogisticsStatus = async (req, res) => {
  try {
    const req2 = await LogisticsRequest.findOneAndUpdate(
      { _id: req.params.id, buyerId: req.user.id },
      { $set: { status: req.body.status } },
      { new: true }
    );
    if (!req2) return res.status(404).json({ message: "Request not found" });
    res.json(req2);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE request ────────────────────────────────────────────────
exports.deleteLogisticsRequest = async (req, res) => {
  try {
    await LogisticsRequest.findOneAndDelete({ _id: req.params.id, buyerId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ESTIMATE only (no DB write) ───────────────────────────────────
exports.estimateCost = async (req, res) => {
  try {
    const { pickupLat, pickupLng, deliveryLat, deliveryLng, quantityTon, vehicleType } = req.query;

    if (!pickupLat || !pickupLng || !deliveryLat || !deliveryLng || !quantityTon) {
      return res.status(400).json({ message: "lat/lng for both ends + quantityTon required" });
    }

    const vType = vehicleType || "Any";
    const distanceKm = Math.round(
      haversineKm(parseFloat(pickupLat), parseFloat(pickupLng), parseFloat(deliveryLat), parseFloat(deliveryLng)) * 10
    ) / 10;

    const ratePerKm = COST_PER_KM[vType] || 35;
    const base      = BASE_CHARGE[vType]  || 1000;
    const loading   = Math.round(parseFloat(quantityTon) * LOADING_PER_TON);
    const estimatedCost   = Math.round(base + (distanceKm * ratePerKm) + loading);
    const estimatedHours  = Math.round(((distanceKm / 50) + 1) * 10) / 10;

    // Return all vehicle type options for comparison
    const comparison = Object.keys(COST_PER_KM).map(vt => ({
      vehicleType: vt,
      estimatedCost: Math.round((BASE_CHARGE[vt] || 1000) + (distanceKm * (COST_PER_KM[vt] || 35)) + loading),
    }));

    res.json({
      distanceKm,
      estimatedCost,
      estimatedHours,
      vehicleType: vType,
      comparison,
      breakdown: {
        base,
        distanceCost: Math.round(distanceKm * ratePerKm),
        loadingCost: loading,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};