const mongoose = require("mongoose");

const residuePostSchema = new mongoose.Schema(
  {
    // Farmer who posted
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Crop info
    cropType:    { type: String, required: true, trim: true },
    season:      { type: String, default: "", trim: true },

    // Residue details
    residueType:       { type: String, default: "", trim: true }, // "Wheat Straw", "Rice Husk" etc.
    estimatedQuantity: { type: Number, required: true },          // tons
    pricePerTon:       { type: Number, default: null },           // asking price (optional)
    availableFrom:     { type: Date, default: Date.now },

    // AI ROI data (snapshot from last report)
    bestMethod:       { type: String, default: "" },
    estimatedProfit:  { type: String, default: "" },
    roiPercent:       { type: Number, default: null },
    biomassValue:     { type: String, default: "" },

    // Location snapshot (from user's location at time of posting)
    location: {
      state:    { type: String, default: "" },
      district: { type: String, default: "" },
      pincode:  { type: String, default: "" },
      lat:      { type: Number, default: null },
      lng:      { type: Number, default: null },
    },

    // Contact preference
    contactPhone:   { type: String, default: "" },
    contactMessage: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["active", "sold", "expired"],
      default: "active",
    },

    // Interested buyers (who clicked "Show Interest")
    interestedBuyers: [
      {
        buyerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name:      { type: String },
        phone:     { type: String },
        message:   { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for geo queries
residuePostSchema.index({ "location.lat": 1, "location.lng": 1 });
residuePostSchema.index({ farmerId: 1 });
residuePostSchema.index({ status: 1 });

module.exports = mongoose.model("ResiduePost", residuePostSchema);