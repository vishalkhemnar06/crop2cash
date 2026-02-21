const mongoose = require("mongoose");

const farmProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landArea: Number,
    soilType: String,
    irrigationType: String,
    equipment: String,
    season: String,
    budgetRange: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FarmProfile", farmProfileSchema);