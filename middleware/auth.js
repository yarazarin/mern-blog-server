// server/middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log("Authorization Header:", token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("Authenticated user:", decoded);
      next(); // Continue to the next middleware or route handler
    } catch (err) {
      console.log("Invalid token:", err.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    // If no token is found, allow access to public routes
    console.log("No token found, proceeding without authentication.");
    next();
  }
};

module.exports = auth;

