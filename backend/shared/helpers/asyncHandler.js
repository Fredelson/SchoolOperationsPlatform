// ============================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Async Handler Helper
//
// Purpose:
// - Wrap async Express controllers
// - Automatically forward errors to global error middleware
// - Remove repeated try/catch blocks from controllers
// ============================================

const asyncHandler = (controllerFunction) => {
  return (req, res, next) => {
    Promise.resolve(controllerFunction(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;