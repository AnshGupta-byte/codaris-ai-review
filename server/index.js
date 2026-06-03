// ─── Load environment variables FIRST ───────────────────────────────────────
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const logger = require('./config/logger');
const { connectWithRetry } = require('./config/db');
const configurePassport = require('./config/passport');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');

// ─── App Setup ───────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ─── Security & CORS ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);


// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ─── HTTP Request Logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    }),
  );
}

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Passport (JWT-only, no sessions) ────────────────────────────────────────
configurePassport(); // registers the GitHub strategy
app.use(passport.initialize());
// NOTE: passport.session() is intentionally NOT called.

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);

// Health check (bypasses auth + rate limits because it's registered before them)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler (MUST be last middleware) ──────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    // Connect to MongoDB (with retry) before accepting traffic
    await connectWithRetry();

    app.listen(PORT, () => {
      logger.info(`🚀 CODARIS server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      logger.info(`📡 Accepting requests from: ${CLIENT_URL}`);

      // ── Keep-alive ping (Render free tier sleeps after 15 min) ──
      // Pings own health endpoint every 10 minutes to stay warm.
      if (process.env.NODE_ENV === 'production') {
        const selfUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
        if (selfUrl) {
          setInterval(async () => {
            try {
              const res = await fetch(`${selfUrl}/api/health`);
              logger.info(`[keepalive] ping → ${res.status}`);
            } catch (err) {
              logger.warn(`[keepalive] ping failed: ${err.message}`);
            }
          }, 10 * 60 * 1000); // every 10 minutes
          logger.info(`[keepalive] Self-ping enabled → ${selfUrl}/api/health`);
        } else {
          logger.warn('[keepalive] RENDER_EXTERNAL_URL not set — add it in Render env vars to enable keep-alive');
        }
      }
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully…');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully…');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise} — reason: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
  process.exit(1);
});

start();

module.exports = app; // exported for testing
