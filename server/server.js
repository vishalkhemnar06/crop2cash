require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ✅ FIX 1: More specific CORS config (update origin for production)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// ✅ FIX 2: Validate critical env variables on startup
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GROQ_API_KEY"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ FATAL: Missing environment variable: ${key}`);
    process.exit(1); // Stop server immediately if config is broken
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);

// ✅ FIX 3: Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ FIX 4: Fallback PORT so server doesn't silently fail
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));