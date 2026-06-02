const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// ---------------------------------------------------------------------------
// POST GitHub callback  (called by Passport after successful OAuth)
// ---------------------------------------------------------------------------

/**
 * githubCallback – Issue a JWT and redirect the user to the client.
 *
 * req.user is populated by Passport's GitHub strategy BEFORE this controller
 * runs (via passport.authenticate middleware in the route).
 */
const githubCallback = (req, res) => {
  try {
    if (!req.user) {
      logger.error('[authController] githubCallback: req.user is missing after passport auth');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/auth/callback?success=false&error=auth_failed`);
    }

    const payload = {
      id: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set HttpOnly, Secure (in production) cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    logger.info(`[authController] User ${req.user.username} authenticated via GitHub`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(`${clientUrl}/auth/callback?success=true`);
  } catch (err) {
    logger.error(`[authController] githubCallback error: ${err.message}`);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(`${clientUrl}/auth/callback?success=false&error=server_error`);
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

/**
 * getMe – Return the authenticated user's profile.
 *
 * req.user is populated by verifyJWT middleware. requireAuth is called
 * before this in the route, so req.user is guaranteed to be non-null.
 */
const getMe = (req, res) => {
  const { _id, githubId, username, email, avatar, plan, reviewCount, createdAt } = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: _id,
      githubId,
      username,
      email,
      avatar,
      plan,
      reviewCount,
      createdAt,
    },
  });
};

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------

/**
 * logout – Clear the JWT cookie and return a success response.
 */
const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  logger.info(`[authController] User ${req.user?.username || 'unknown'} logged out`);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

module.exports = { githubCallback, getMe, logout };
