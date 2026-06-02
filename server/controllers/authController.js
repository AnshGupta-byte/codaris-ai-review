const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// ---------------------------------------------------------------------------
// GET /api/auth/github/callback  (called by Passport after successful OAuth)
// ---------------------------------------------------------------------------

/**
 * githubCallback – Issue a JWT and redirect the user to the client.
 * Reads the _c_remember cookie set before the OAuth redirect to determine
 * whether to issue a 30-day or 7-day session.
 */
const githubCallback = (req, res) => {
  try {
    if (!req.user) {
      logger.error('[authController] githubCallback: req.user is missing after passport auth');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/auth/callback?success=false&error=auth_failed`);
    }

    // Read remember preference from the temp cookie set before OAuth redirect
    const remember = req.cookies._c_remember === '1';

    // Clear the temp cookie immediately
    res.clearCookie('_c_remember', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    const expiresIn = remember ? '30d' : '7d';
    const maxAge = remember
      ? 30 * 24 * 60 * 60 * 1000  // 30 days in ms
      : 7 * 24 * 60 * 60 * 1000;  // 7 days in ms

    const payload = {
      id: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge,
    });

    logger.info(
      `[authController] User ${req.user.username} authenticated via GitHub ` +
      `(remember: ${remember}, expires: ${expiresIn})`
    );

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
