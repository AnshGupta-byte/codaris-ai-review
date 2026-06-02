const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, colorize, printf, errors, json } = format;

// Custom console format with colorized output
const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const base = `${ts} [${level}]: ${stack || message}`;
  return base;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    // Console transport – colorized, human-readable
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat,
      ),
    }),

    // Error log – only error-level messages
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json(),
      ),
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),

    // Combined log – all messages
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json(),
      ),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10,
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
