const rateLimit = require('express-rate-limit');

/**
 * generalLimiter – Applied to all API routes.
 * 30 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers (RFC 6585)
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use the forwarded IP when behind a reverse proxy (e.g. nginx / Render)
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
});

/**
 * reviewLimiter – Applied exclusively to POST /api/review.
 * 10 requests per hour per IP (AI calls are expensive).
 */
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have reached the review limit (10 per hour). Please try again later.',
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
});

module.exports = { generalLimiter, reviewLimiter };
