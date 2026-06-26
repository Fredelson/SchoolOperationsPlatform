// ============================================
// ARAB UNITY SCHOOL
// Global Error Middleware
//
// Purpose:
// - Handle unexpected backend errors consistently
// - Prevent raw server errors from leaking to frontend
// ============================================

const errorMiddleware = (err, req, res, next) => {
  console.error("❌ Backend Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;