const logger = require('../config/logger');

/**
 * Global error handling middleware.
 *
 * Must be registered LAST in the Express middleware chain.
 * Signature must have exactly 4 parameters so Express recognises it as an
 * error handler.
 *
 * Returns: JSON { success: false, message, stack? }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code wasn't set earlier in the pipeline
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || false;

  // Log all errors; use 'error' level for 5xx, 'warn' for 4xx
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    });
  } else {
    logger.warn({
      message: err.message,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    });
  }

  const isDev = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    message: isOperational || isDev ? err.message : 'An unexpected server error occurred.',
  };

  // Include stack trace in development for faster debugging
  if (isDev && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Convenience factory to create operational (expected) errors with an HTTP status.
 *
 * Usage: next(createError(404, 'Review not found'))
 */
const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

module.exports = { errorHandler, createError };
