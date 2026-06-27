// backend/modules/auth/services/authService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Auth Service
 * ============================================================
 *
 * Purpose:
 * Contains authentication business logic.
 *
 * Responsibilities:
 * - Validate credentials.
 * - Check locked/inactive user state.
 * - Compare password with bcrypt hash.
 * - Generate JWT.
 * - Return safe user payload to frontend.
 *
 * Architecture:
 * Route → Controller → Service → Repository → Database
 * ============================================================
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authRepository = require("../repositories/authRepository");

/**
 * Builds a safe user object for frontend use.
 *
 * Important:
 * - PasswordHash is never returned.
 * - role keeps old frontend compatibility.
 * - roleKey is the new enterprise role identifier.
 *
 * @param {object} user - Database user record.
 * @returns {object} Safe user payload.
 */
function buildUserPayload(user) {
  return {
    id: user.UserId,
    employeeId: user.EmployeeId,
    fullName: user.FullName,
    email: user.SchoolEmail,
    personalEmail: user.PersonalEmail,
    mobileNumber: user.MobileNumber,

    roleId: user.RoleId,
    roleKey: user.RoleKey,
    roleName: user.RoleName,
    roleDisplayName: user.RoleDisplayName,

    // Backward compatibility for existing frontend checks.
    role: user.RoleKey || user.LegacyRole,

    departmentId: user.DepartmentId,
    departmentName: user.DepartmentName,
    sectionId: user.SectionId,
    sectionName: user.SectionName,

    defaultWorkspaceId: user.DefaultWorkspaceId,
    legacyRole: user.LegacyRole,
    mustChangePassword: user.MustChangePassword,
    emailVerified: user.EmailVerified,
    isRegistrationCompleted: user.IsRegistrationCompleted,
    isProtectedRole: user.IsProtectedRole,
  };
}

/**
 * Generates a JWT token.
 *
 * @param {object} user - Database user record.
 * @returns {string} Signed JWT token.
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.UserId,
      employeeId: user.EmployeeId,
      fullName: user.FullName,
      email: user.SchoolEmail,

      roleId: user.RoleId,
      roleKey: user.RoleKey,
      role: user.RoleKey || user.LegacyRole,

      departmentId: user.DepartmentId,
      sectionId: user.SectionId,
      defaultWorkspaceId: user.DefaultWorkspaceId,
      isProtectedRole: user.IsProtectedRole,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
}

/**
 * Authenticates login.
 *
 * Route:
 * POST /api/auth/login
 *
 * @param {string} employeeId - User employee ID.
 * @param {string} password - Plain text password.
 * @returns {Promise<object>} Token and safe user payload.
 */
async function login(employeeId, password) {
  const user = await authRepository.findActiveUserByEmployeeId(employeeId);

  if (!user) {
    const error = new Error("Invalid employee ID or password.");
    error.statusCode = 401;
    throw error;
  }

  if (user.IsLocked) {
    const error = new Error("Your account is locked. Please contact IT.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.PasswordHash) {
    const error = new Error("Password is not configured for this account.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid employee ID or password.");
    error.statusCode = 401;
    throw error;
  }

  await authRepository.markLoginSuccess(user.UserId);

  return {
    token: generateToken(user),
    user: buildUserPayload(user),
  };
}

/**
 * Gets the current authenticated user.
 *
 * Route:
 * GET /api/auth/me
 *
 * @param {number} userId - User ID from JWT.
 * @returns {Promise<object>} Safe user profile.
 */
async function getMe(userId) {
  const user = await authRepository.findActiveUserById(userId);

  if (!user) {
    const error = new Error("User not found or inactive.");
    error.statusCode = 404;
    throw error;
  }

  return buildUserPayload(user);
}

module.exports = {
  login,
  getMe,
};