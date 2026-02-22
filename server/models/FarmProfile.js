const mongoose = require("mongoose");


const farmProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },


    // Crop — preset or custom
    cropType:       { type: String, default: "", trim: true },
    customCropType: { type: String, default: "", trim: true },


    // Land area — min 0.1 acres
    landArea: { type: Number, default: 0.1, min: 0.1 },


    // Soil type
    soilType: { type: String, default: "", trim: true },


    // Irrigation type
    irrigationType: { type: String, default: "", trim: true },


    // Equipment — array of presets + optional custom entry
    equipment:       { type: [String], default: [] },
    customEquipment: { type: String, default: "", trim: true },


    // Season
    season: { type: String, default: "", trim: true },


    // Budget — preset label OR "Custom" + customBudget number
    budgetRange:  { type: String, default: "", trim: true },
    customBudget: { type: Number, default: null },
  },
  { timestamps: true }
);


module.exports = mongoose.model("FarmProfile", farmProfileSchema);


