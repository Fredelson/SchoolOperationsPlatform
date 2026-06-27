// backend/shared/errors/AppError.js

/**
 * Base application error.
 * Used to standardize service-level errors.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;