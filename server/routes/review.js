const express = require('express');
const { reviewLimiter } = require('../middleware/rateLimiter');
const { verifyJWT, requireAuth } = require('../middleware/auth');
const {
  submitReview,
  getReviewHistory,
  getReviewById,
} = require('../controllers/reviewController');

const router = express.Router();

/**
 * POST /api/review
 * Submit code for AI review.
 * - Rate-limited (10/hour)
 * - Auth optional: anonymous users get results but history is not saved
 */
router.post('/', reviewLimiter, verifyJWT, submitReview);

/**
 * GET /api/review
 * Fetch the authenticated user's paginated review history.
 * Query: ?page=1&limit=10
 */
router.get('/', verifyJWT, requireAuth, getReviewHistory);

/**
 * GET /api/review/:id
 * Fetch a single review by ID (must belong to the authenticated user).
 */
router.get('/:id', verifyJWT, requireAuth, getReviewById);

module.exports = router;
