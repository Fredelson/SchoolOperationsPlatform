// backend/shared/helpers/apiResponse.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Shared API Response Helper
 * ============================================================
 *
 * Purpose:
 * Provides a consistent API response format across the
 * entire backend.
 *
 * Architecture:
 * Controller
 *      ↓
 * sendSuccess() / sendError()
 *      ↓
 * HTTP Response
 *
 * Standard Success Response:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {}
 * }
 *
 * Standard Error Response:
 *
 * {
 *   success: false,
 *   message: "...",
 *   errors: []
 * }
 *
 * ============================================================
 */

/**
 * Sends a successful API response.
 *
 * @param {object} res - Express response object.
 * @param {string} message - Success message.
 * @param {*} data - Payload to return.
 * @param {number} statusCode - HTTP status code.
 */
function sendSuccess(
  res,
  message = "Success.",
  data = null,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends an error API response.
 *
 * @param {object} res - Express response object.
 * @param {string} message - Error message.
 * @param {number} statusCode - HTTP status code.
 * @param {*} errors - Optional validation or error details.
 */
function sendError(
  res,
  message = "Request failed.",
  statusCode = 500,
  errors = null
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};