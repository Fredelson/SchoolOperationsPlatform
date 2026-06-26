// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// API Response Helper
//
// Purpose:
// - Keep all API responses consistent
// - Reduce repeated res.status(...).json(...)
// - Make frontend response handling predictable
// ============================================

// ============================================
// Success Response
// ============================================

const sendSuccess = (
  res,
  message = "Request completed successfully.",
  data = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// ============================================
// Error Response
// ============================================

const sendError = (
  res,
  message = "Something went wrong.",
  statusCode = 500,
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

// ============================================
// Exports
// ============================================

module.exports = {
  sendSuccess,
  sendError,
};