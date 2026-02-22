const mongoose = require("mongoose");

const buyerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // What they buy
    materialTypes: {
      type: [String],
      default: [],
      // e.g. ["Compost", "Biochar", "Pellets", "Animal Feed / Straw Bales", "Briquettes", "Biogas Feedstock", "Any"]
    },

    // Pricing
    pricePerTon: { type: Number, default: null },       // Rs per ton they offer
    minQuantity: { type: Number, default: 1 },          // minimum tons they buy
    maxQuantity: { type: Number, default: null },        // max tons (optional)

    // Logistics
    maxDistanceKm:   { type: Number, default: 50 },     // radius they cover
    pickupAvailable: { type: Boolean, default: false }, // they come pick up?
    paymentTerms:    { type: String, default: "" },     // e.g. "Cash on delivery", "Advance"

    // Business info
    businessName:  { type: String, default: "", trim: true },
    businessType:  { type: String, default: "", trim: true }, // Factory, Dairy, Nursery, etc.
    workingDays:   { type: String, default: "Mon-Sat" },
    contactPerson: { type: String, default: "", trim: true },

    // Status
    isActive:   { type: Boolean, default: true },
    verified:   { type: Boolean, default: false },
    description:{ type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyerProfile", buyerProfileSchema);