// ============================================
// ARAB UNITY SCHOOL
// Async Handler Utility
//
// Purpose:
// - Catch async controller errors automatically
// - Forward errors to global error middleware
// ============================================

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;