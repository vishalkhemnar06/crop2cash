const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── REGISTER ─────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      fullName, phoneNumber, password, confirmPassword,
      role,
      state, district, taluka, localAddress,
      pincode, lat, lng,
    } = req.body;

    if (!fullName || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ message: "Name, phone, and password are required" });
    }

    if (!state || !district) {
      return res.status(400).json({ message: "State and district are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Only farmer and buyer are allowed via public registration
    const allowedRoles = ["farmer", "buyer"];
    const assignedRole = allowedRoles.includes(role) ? role : "farmer";

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this phone number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const locationObj = {
      state:        state        || "",
      district:     district     || "",
      taluka:       taluka       || "",
      localAddress: localAddress || "",
      pincode:      pincode      || "",
      lat:          lat          ? parseFloat(lat)  : null,
      lng:          lng          ? parseFloat(lng)  : null,
    };

    await User.create({
      fullName,
      phoneNumber,
      passwordHash: hashedPassword,
      role: assignedRole,
      location: locationObj,
      // keep flat fields for backward compat
      state:        locationObj.state,
      district:     locationObj.district,
      taluka:       locationObj.taluka,
      localAddress: locationObj.localAddress,
    });

    res.status(201).json({ message: "Registered Successfully", role: assignedRole });

  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ FATAL: JWT_SECRET is missing in .env");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      fullName: user.fullName,
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};