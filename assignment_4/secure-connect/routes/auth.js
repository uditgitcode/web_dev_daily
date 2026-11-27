const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { users } = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const appEvents = require("../events/appEvents");

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (users.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, rounds);

    const admins = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    const role = admins.includes(normalizedEmail) ? "admin" : "user";

    const user = users.insert({ username: username.trim(), email: normalizedEmail, password: hashedPassword, role });
    appEvents.emit("user:registered", user);

    res.status(201).json({ message: "User registered", id: user._id, username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = users.findOne({ email: email.toLowerCase().trim() });
    const valid = user && (await bcrypt.compare(password, user.password));
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    appEvents.emit("user:login", user);
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me  (protected) - current user's profile
router.get("/me", verifyToken, (req, res) => {
  const user = users.findOne({ _id: req.user.id });
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password, ...profile } = user; // never send the hash
  res.json(profile);
});

module.exports = router;
