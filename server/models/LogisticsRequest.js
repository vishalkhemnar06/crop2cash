const mongoose = require("mongoose");

const logisticsRequestSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResiduePost",
      default: null,
    },

    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BuyerDeal",
      default: null,
    },

    // Pickup & Delivery
    pickupAddress:   { type: String, required: true, trim: true },
    pickupLat:       { type: Number, default: null },
    pickupLng:       { type: Number, default: null },
    deliveryAddress: { type: String, required: true, trim: true },
    deliveryLat:     { type: Number, default: null },
    deliveryLng:     { type: Number, default: null },

    // Cargo
    cargoType:   { type: String, default: "", trim: true },
    quantityTon: { type: Number, required: true },
    vehicleType: {
      type: String,
      enum: ["Mini Truck (1T)", "Medium Truck (5T)", "Large Truck (10T)", "Tractor Trolley", "Any"],
      default: "Any",
    },

    // Dates
    pickupDate:   { type: Date, default: null },
    deliveryDate: { type: Date, default: null },

    // Estimates (calculated by backend)
    distanceKm:    { type: Number, default: null },
    estimatedCost: { type: Number, default: null },  // Rs
    estimatedHours:{ type: Number, default: null },

    // Status
    status: {
      type: String,
      enum: ["pending", "quoted", "confirmed", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },

    // Trucker details (from our partner network)
    truckerName:  { type: String, default: "", trim: true },
    truckerPhone: { type: String, default: "", trim: true },
    truckerNote:  { type: String, default: "", trim: true },

    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

logisticsRequestSchema.index({ buyerId: 1, createdAt: -1 });
logisticsRequestSchema.index({ status: 1 });

module.exports = mongoose.model("LogisticsRequest", logisticsRequestSchema);