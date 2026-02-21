const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      password,
      confirmPassword,
      role,
      state,
      district,
      taluka,
      localAddress,
    } = req.body;

    // ✅ FIX 1: Validate all required fields exist
    if (!fullName || !phoneNumber || !password || !confirmPassword || !state || !district || !taluka || !localAddress) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // ✅ FIX 2: Prevent self-registration as admin via API
    // Only 'farmer' is allowed from the public register endpoint
    const allowedRoles = ["farmer"];
    const assignedRole = allowedRoles.includes(role) ? role : "farmer";

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this phone number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      phoneNumber,
      passwordHash: hashedPassword,
      role: assignedRole, // ✅ Always use sanitized role
      state,
      district,
      taluka,
      localAddress,
    });

    res.status(201).json({ message: "Registered Successfully" });

  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // ✅ FIX 3: Validate inputs
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    // ✅ FIX 4: Guard against missing JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("❌ FATAL: JWT_SECRET is missing in .env");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ FIX 5: Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

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