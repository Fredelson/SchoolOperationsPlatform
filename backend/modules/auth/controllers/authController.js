// backend/modules/auth/controllers/authController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Auth Controller
 * ============================================================
 *
 * Purpose:
 * Handles HTTP requests for authentication.
 *
 * Responsibilities:
 * - Receive request data.
 * - Call Auth service.
 * - Return API response.
 *
 * Notes:
 * - No SQL queries here.
 * - No password comparison here.
 * - No JWT logic here.
 * ============================================================
 */

const authService = require("../services/authService");

/**
 * Login user.
 *
 * Route:
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and password are required.",
      });
    }

    const result = await authService.login(employeeId, password);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user.
 *
 * Route:
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    const user = await authService.getMe(userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  getMe,
};