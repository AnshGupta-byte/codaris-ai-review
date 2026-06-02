const mongoose = require('mongoose');
const logger = require('./logger');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

/**
 * Attempt a single Mongoose connection.
 */
async function connect() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
}

/**
 * Connect to MongoDB with exponential-backoff retry.
 * @param {number} attempt - current attempt number (1-indexed)
 */
async function connectWithRetry(attempt = 1) {
  try {
    await connect();
    logger.info(`✅ MongoDB connected successfully (attempt ${attempt})`);
  } catch (err) {
    logger.error(`❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);

    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt; // simple linear backoff
      logger.info(`🔄 Retrying MongoDB connection in ${delay / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectWithRetry(attempt + 1);
    }

    logger.error('⚠️  MongoDB unavailable after max retries. Server running WITHOUT database.');
    logger.warn('📝 Guest reviews will still work. Authenticated features require MongoDB.');
    // Do NOT exit — let the server run in degraded mode
  }
}

// Mongoose event listeners
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔁 MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime error: ${err.message}`);
});

module.exports = { connectWithRetry };
