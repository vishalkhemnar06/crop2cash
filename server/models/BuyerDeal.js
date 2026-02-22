const mongoose = require("mongoose");

const buyerDealSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResiduePost",
      default: null,
    },

    // Deal details
    cropType:    { type: String, required: true, trim: true },
    residueType: { type: String, default: "",   trim: true },
    quantity:    { type: Number, required: true },           // tons
    pricePerTon: { type: Number, required: true },           // Rs
    totalAmount: { type: Number },                           // auto-computed

    // Status
    status: {
      type: String,
      enum: ["negotiating", "confirmed", "completed", "cancelled"],
      default: "confirmed",
    },

    // Dates
    dealDate:     { type: Date, default: Date.now },
    deliveryDate: { type: Date, default: null },

    // Location snapshot
    pickupLocation: { type: String, default: "", trim: true },
    deliveryLocation: { type: String, default: "", trim: true },

    // Environmental impact (calculated field)
    co2SavedKg: { type: Number, default: 0 },  // vs burning

    // Transport
    transportMode:  { type: String, default: "", trim: true },
    transportCost:  { type: Number, default: 0 },
    transportNotes: { type: String, default: "", trim: true },

    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Auto-compute totalAmount and co2SavedKg before save
buyerDealSchema.pre("save", function (next) {
  if (this.quantity && this.pricePerTon) {
    this.totalAmount = Math.round(this.quantity * this.pricePerTon);
  }
  // Average CO2 saved vs burning: 1 ton residue burned = ~1.5 ton CO2 equivalent
  if (this.quantity) {
    this.co2SavedKg = Math.round(this.quantity * 1500);
  }
  next();
});

buyerDealSchema.index({ buyerId: 1, dealDate: -1 });
buyerDealSchema.index({ buyerId: 1, cropType: 1 });

module.exports = mongoose.model("BuyerDeal", buyerDealSchema);