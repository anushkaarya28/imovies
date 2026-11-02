
const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("name email role");
    console.log("Token user ID:", decoded.userId);
    console.log("Database role:", user?.role); 

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }

    req.userId = user._id;
    req.userRole = user.role;
    console.log("Authenticated user:", user.name, user.email, user.role);
    console.log("Admin check:", user.email, user.role);

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
}

function adminMiddleware(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
