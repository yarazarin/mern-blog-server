// server/middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Check if there's a token in the header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next(); // Continue to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    // If no token is found, allow access to public routes
    next();
  }
};

module.exports = auth;

