// backend/shared/errors/index.js

/**
 * Shared HTTP error helpers.
 */

const AppError = require("./AppError");

class BadRequestError extends AppError {
  constructor(message = "Bad request.", details = null) {
    super(message, 400, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized.", details = null) {
    super(message, 401, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden.", details = null) {
    super(message, 403, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found.", details = null) {
    super(message, 404, details);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict.", details = null) {
    super(message, 409, details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};