// Admin-only routes demonstrating role-based access control (RBAC)
const express = require("express");
const { users, notes } = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
router.use(verifyToken, authorizeRoles("admin"));

// GET /api/admin/users - list all users (without password hashes)
router.get("/users", (req, res) => {
  res.json(users.find().map(({ password, ...u }) => u));
});

// GET /api/admin/notes - list every note in the system
router.get("/notes", (req, res) => {
  res.json(notes.find());
});

module.exports = router;
