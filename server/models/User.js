const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,   // unique already creates an index — no separate .index() needed
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // createdAt is managed manually above
    versionKey: false,
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
