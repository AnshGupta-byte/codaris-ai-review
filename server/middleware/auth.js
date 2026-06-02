const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * verifyJWT – Soft authentication middleware.
 *
 * Reads the JWT from:
 *   1. HttpOnly cookie `token`
 *   2. `Authorization: Bearer <token>` header
 *
 * On valid token  → populates req.user with the DB user document.
 * On invalid/missing → sets req.user = null and calls next()
 * so that individual routes can decide whether auth is required.
 */
const verifyJWT = async (req, res, next) => {
  try {
    let token = null;

    // 1. Try cookie first (preferred for browser clients)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fall back to Authorization header (for API clients / mobile)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (catches deleted / deactivated accounts)
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (err) {
    // Expired or tampered tokens are treated as unauthenticated (not an error)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      req.user = null;
      return next();
    }

    logger.error(`verifyJWT unexpected error: ${err.message}`);
    req.user = null;
    next();
  }
};

/**
 * requireAuth – Hard authentication guard.
 *
 * Must be used AFTER verifyJWT. Returns 401 if req.user is not populated.
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this resource.',
    });
  }
  next();
};

module.exports = { verifyJWT, requireAuth };
