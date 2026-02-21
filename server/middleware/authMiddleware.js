const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  // ✅ FIX 1: More robust token extraction
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  // ✅ FIX 2: Guard against missing JWT_SECRET in env
  if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL: JWT_SECRET is missing in .env");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // ✅ FIX 3: Differentiate between expired vs invalid token
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};