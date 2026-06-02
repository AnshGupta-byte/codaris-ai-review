const passport = require('passport');
const { Strategy: GitHubStrategy } = require('passport-github2');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Configure Passport with the GitHub OAuth2 strategy.
 *
 * NOTE: We are NOT using sessions (passport.session() is never called).
 * Authentication state is carried entirely by our JWT cookie.
 */
function configurePassport() {
  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackURL = process.env.GITHUB_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    logger.warn(
      '⚠️  GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL) ' +
        'are not fully configured. GitHub login will be unavailable.',
    );
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: clientID || 'PLACEHOLDER',
        clientSecret: clientSecret || 'PLACEHOLDER',
        callbackURL: callbackURL || 'http://localhost:5000/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const githubId = profile.id;
          const username = profile.username;
          const avatar = profile.photos?.[0]?.value || null;
          const email = profile.emails?.[0]?.value || null;

          // Try to find existing user
          let user = await User.findOne({ githubId });

          if (!user) {
            // Create new user on first login
            user = await User.create({
              githubId,
              username,
              avatar,
              email,
              plan: 'free',
              reviewCount: 0,
              createdAt: new Date(),
            });
            logger.info(`[passport] New user created: ${username} (githubId: ${githubId})`);
          } else {
            // Update mutable fields that might change between logins
            user.username = username;
            user.avatar = avatar;
            if (email && email !== user.email) user.email = email;
            await user.save();
            logger.info(`[passport] Existing user authenticated: ${username}`);
          }

          return done(null, user);
        } catch (err) {
          logger.error(`[passport] GitHub strategy error: ${err.message}`);
          return done(err, null);
        }
      },
    ),
  );

  // No session serialization needed (JWT-only auth)
  // But Passport requires these to be defined even when not using sessions.
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  return passport;
}

module.exports = configurePassport;
