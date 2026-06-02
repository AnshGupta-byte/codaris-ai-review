const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    line: {
      type: Number,
    },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info', 'suggestion'],
      required: true,
    },
    category: {
      type: String,
      enum: ['security', 'performance', 'style', 'logic', 'maintainability'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    suggestion: {
      type: String,
    },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
    },
    language: {
      type: String,
      default: 'javascript',
      lowercase: true,
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
    },
    issues: {
      type: [issueSchema],
      default: [],
    },
    positives: {
      type: [String],
      default: [],
    },
    overallSuggestions: {
      type: [String],
      default: [],
    },
    aiProvider: {
      type: String,
    },
    tokensUsed: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

// Compound index for efficient pagination queries (userId + createdAt)
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
