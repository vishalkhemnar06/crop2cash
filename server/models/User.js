const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName:     { type: String, required: true, trim: true },
    phoneNumber:  { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["farmer", "buyer", "admin"],
      required: true,
      default: "farmer",
    },

    // ── Location (nested object) ──────────────────────────────────
    location: {
      state:        { type: String, default: "", trim: true },
      district:     { type: String, default: "", trim: true },
      taluka:       { type: String, default: "", trim: true },
      localAddress: { type: String, default: "", trim: true },
      pincode:      { type: String, default: "", trim: true },
      lat:          { type: Number, default: null },
      lng:          { type: Number, default: null },
    },

    // Keep old flat fields for backward compat (populated from location on save)
    state:        { type: String, default: "" },
    district:     { type: String, default: "" },
    taluka:       { type: String, default: "" },
    localAddress: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: display name for location
userSchema.virtual("displayLocation").get(function () {
  const l = this.location;
  return [l.district, l.state].filter(Boolean).join(", ") || "Location not set";
});

module.exports = mongoose.model("User", userSchema);