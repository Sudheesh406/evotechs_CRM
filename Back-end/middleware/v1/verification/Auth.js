const jwt = require('jsonwebtoken');
const { httpSuccess, httpError } = require('../../../utils/v1/httpResponse'); 

const authenticate = (req, res, next) => {
  const token = req.cookies?.crm_checkin_pass; 
  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return httpError(res, 500, "Server error: Missing JWT secret", err.message);
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return httpError(res, 401, "Unauthorized: Invalid token", err.message);
  }
};

module.exports = { authenticate };
