const express = require('express');
const passport = require('passport');
const { githubCallback, getMe, logout } = require('../controllers/authController');
const { verifyJWT, requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/auth/github
 * Initiates the GitHub OAuth2 flow.
 * Accepts ?remember=1 to set a 30-day session instead of 7-day.
 */
router.get('/github', (req, res, next) => {
  // Store remember preference in a short-lived cookie that survives the OAuth redirect
  const remember = req.query.remember === '1';
  res.cookie('_c_remember', remember ? '1' : '0', {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 minutes — just enough for the OAuth flow
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

/**
 * GET /api/auth/github/callback
 * GitHub redirects here after the user authorizes (or denies) the app.
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
