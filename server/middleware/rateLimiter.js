const rateLimit = require('express-rate-limit');
const isDev = process.env.NODE_ENV !== 'production';

/**
 * generalLimiter – Applied to all API routes.
 * Disabled in development. 200 requests per 15 minutes in production.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skip: () => isDev, // Disable entirely in development
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
});

/**
 * reviewLimiter – Applied exclusively to POST /api/review.
 * 50/hour in dev, 10/hour in production.
 */
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 50 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have reached the review limit (10 per hour). Please try again later.',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
});

module.exports = { generalLimiter, reviewLimiter };
