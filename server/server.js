require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const authRoutes            = require("./routes/authRoutes");
const profileRoutes         = require("./routes/profileRoutes");
const aiRoutes              = require("./routes/aiRoutes");
const buyerRoutes           = require("./routes/buyerRoutes");
const buyerExtendedRoutes   = require("./routes/buyerExtendedRoutes");
const residuePostRoutes     = require("./routes/residuePostRoutes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GROQ_API_KEY"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ FATAL: Missing environment variable: ${key}`);
    process.exit(1);
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => { console.error("❌ MongoDB Connection Failed:", err.message); process.exit(1); });

// Routes
app.use("/api/auth",        authRoutes);
app.use("/api/profile",     profileRoutes);
app.use("/api/ai",          aiRoutes);
app.use("/api/buyer",       buyerRoutes);
app.use("/api/buyer-ext",   buyerExtendedRoutes);   // ← NEW: favorites, analytics, deals, logistics
app.use("/api/posts",       residuePostRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));