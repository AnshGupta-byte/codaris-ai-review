const Review = require('../models/Review');
const User = require('../models/User');
const { reviewCode } = require('../services/aiService');
const { createError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// ---------------------------------------------------------------------------
// POST /api/review
// ---------------------------------------------------------------------------

/**
 * submitReview – Validate code, call AI, optionally persist, return result.
 */
const submitReview = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;

    // --- Validation ---
    if (!code || typeof code !== 'string') {
      return next(createError(400, 'Code is required and must be a string.'));
    }

    const trimmedCode = code.trim();
    if (trimmedCode.length === 0) {
      return next(createError(400, 'Code cannot be empty.'));
    }

    if (trimmedCode.length > 50000) {
      return next(
        createError(
          400,
          `Code exceeds the maximum allowed length of 50,000 characters (submitted: ${trimmedCode.length}).`,
        ),
      );
    }

    // --- AI Review ---
    logger.info(
      `[reviewController] Submitting review for language: ${language}, ` +
        `user: ${req.user?._id || 'anonymous'}`,
    );

    const reviewResult = await reviewCode(trimmedCode, language);

    // --- Persist & update user stats (only for authenticated users) ---
    let savedReview = null;
    if (req.user && !reviewResult.error) {
      try {
        savedReview = await Review.create({
          userId: req.user._id,
          code: trimmedCode,
          language,
          score: reviewResult.score,
          summary: reviewResult.summary,
          issues: reviewResult.issues,
          positives: reviewResult.positives,
          overallSuggestions: reviewResult.overallSuggestions,
          aiProvider: reviewResult.aiProvider,
          tokensUsed: reviewResult.tokensUsed,
          createdAt: new Date(),
        });

        // Increment the user's review count atomically
        await User.findByIdAndUpdate(req.user._id, { $inc: { reviewCount: 1 } });

        logger.info(`[reviewController] Review saved: ${savedReview._id}`);
      } catch (dbErr) {
        // DB failure should NOT crash the response – the review result is still valid
        logger.error(`[reviewController] Failed to save review to DB: ${dbErr.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      reviewId: savedReview?._id || null,
      ...reviewResult,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/review  (requires auth)
// ---------------------------------------------------------------------------

/**
 * getReviewHistory – Paginated list of reviews for the logged-in user.
 *
 * Query params:
 *   page  – page number (default 1)
 *   limit – items per page (default 10, max 50)
 */
const getReviewHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        // Exclude full code from list view for performance; client can fetch by ID
        .select('-code')
        .lean(),
      Review.countDocuments({ userId: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/review/:id  (requires auth)
// ---------------------------------------------------------------------------

/**
 * getReviewById – Fetch a single review owned by the logged-in user.
 */
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      userId: req.user._id, // ensure ownership
    }).lean();

    if (!review) {
      return next(createError(404, 'Review not found or you do not have access to it.'));
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err) {
    // CastError from invalid ObjectId
    if (err.name === 'CastError') {
      return next(createError(400, 'Invalid review ID format.'));
    }
    next(err);
  }
};

module.exports = { submitReview, getReviewHistory, getReviewById };
