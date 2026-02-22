const mongoose = require("mongoose");

const buyerFavoriteSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:    { type: String, enum: ["farmer", "post"], required: true },
    farmerId:{ type: mongoose.Schema.Types.ObjectId, ref: "User",        default: null },
    postId:  { type: mongoose.Schema.Types.ObjectId, ref: "ResiduePost", default: null },
    note:    { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyerFavorite", buyerFavoriteSchema);