// ============================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Auth Controller
//
// Purpose:
// - Handle Auth HTTP requests/responses
// - Delegate business logic to authService
// ============================================

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { loginUser, getCurrentUser } = require("../services/authService");

// ============================================
// POST /api/auth/login
// ============================================

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
});

// ============================================
// GET /api/auth/me
// ============================================

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return res.status(200).json({
    success: true,
    message: "User profile loaded successfully",
    user,
  });
});

module.exports = {
  login,
  getMe,
};