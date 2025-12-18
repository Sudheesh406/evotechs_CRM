const jwt = require("jsonwebtoken");
const { httpError } = require("../../../utils/v1/httpResponse");
const signup = require("../../../models/v1/Authentication/authModel");

const authenticate = async (req, res, next) => {
  const token = req.cookies?.crm_checkin_pass;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return httpError(res, 500, "Server error: Missing JWT secret");
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    // ✅ Fetch user from DB
    const user = await signup.findOne({ where: { id: decoded.id } });

    if (!user) {
      res.clearCookie("crm_checkin_pass");
      return httpError(res, 401, "User not found");
    }

    // ❌ If user NOT verified → clear cookie & block access
    if (user.verified) {
      res.clearCookie("crm_checkin_pass", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return httpError(res, 403, "User not verified");
    }

    next();
  } catch (err) {
    console.error("JWT error:", err);

    res.clearCookie("crm_checkin_pass");

    return httpError(res, 401, "Unauthorized: Invalid token", err.message);
  }
};

module.exports = { authenticate };
