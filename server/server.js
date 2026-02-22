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

/* ==============================
   ✅ ENVIRONMENT CHECK
================================= */
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "GROQ_API_KEY"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ FATAL: Missing environment variable: ${key}`);
    process.exit(1);
  }
});

/* ==============================
   ✅ CORS CONFIGURATION
================================= */
const allowedOrigins = [
  process.env.CLIENT_URL,        // Production frontend (Vercel)
  "http://localhost:5173",       // Local development
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman/curl
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

/* ==============================
   ✅ MIDDLEWARE
================================= */
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   ✅ DATABASE CONNECTION
================================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

/* ==============================
   ✅ HEALTH CHECK ROUTE
   (Important for Render)
================================= */
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Crop2Cash Backend Running" });
});

/* ==============================
   ✅ ROUTES
================================= */
app.use("/api/auth",      authRoutes);
app.use("/api/profile",   profileRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/buyer",     buyerRoutes);
app.use("/api/buyer-ext", buyerExtendedRoutes);
app.use("/api/posts",     residuePostRoutes);

/* ==============================
   ✅ GLOBAL ERROR HANDLER
================================= */
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* ==============================
   ✅ SERVER START
================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
