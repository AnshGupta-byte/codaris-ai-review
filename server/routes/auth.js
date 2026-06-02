const express = require('express');
const passport = require('passport');
const { githubCallback, getMe, logout } = require('../controllers/authController');
const { verifyJWT, requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/auth/github
 * Initiates the GitHub OAuth2 flow.
 */
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false }),
);

/**
 * GET /api/auth/github/callback
 * GitHub redirects here after the user authorizes (or denies) the app.
 * On failure, redirect to the client with an error flag.
 */
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?success=false&error=github_denied`,
  }),
  githubCallback,
);

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', verifyJWT, requireAuth, getMe);

/**
 * POST /api/auth/logout
 * Clears the JWT cookie and invalidates the client session.
 */
router.post('/logout', logout);

module.exports = router;
