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
    const { identifier: submittedIdentifier, employeeId, email, password } =
      req.body || {};
    const identifier = submittedIdentifier || employeeId || email;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "ID number or email and password are required.",
      });
    }

    const result = await authService.login(identifier, password);

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
async function changePassword(req,res,next){try{const result=await authService.changePassword(req.user.id,req.body?.currentPassword,req.body?.newPassword);return res.status(200).json({success:true,message:"Password changed successfully.",data:result});}catch(error){next(error);}}

module.exports = {
  login,
  getMe,
  changePassword,
};
