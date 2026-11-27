const jwt = require("jsonwebtoken");

// Read token from "Authorization: Bearer <token>" header or a "token" cookie
function getToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);

  const cookies = req.headers.cookie || "";
  const match = cookies.split(";").map((c) => c.trim()).find((c) => c.startsWith("token="));
  return match ? decodeURIComponent(match.slice(6)) : null;
}

// Protect routes: only requests with a valid JWT get through
function verifyToken(req, res, next) {
  const token = getToken(req);
  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Role-based access control: authorizeRoles("admin")
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };
