const mongoose = require("mongoose");

const farmProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cropType: { type: String, default: "" }, // Added
  landArea: { type: Number, default: 0 },
  soilType: { type: String, default: "" },
  irrigationType: { type: String, default: "" },
  equipment: { type: String, default: "" },
  season: { type: String, default: "" },
  budgetRange: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("FarmProfile", farmProfileSchema);