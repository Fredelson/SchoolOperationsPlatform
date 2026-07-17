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
const permissionResolver = require("../../permissionResolver/services/permissionResolverService");

function groupAssignments(scopes) {
  const grouped = new Map();
  for (const row of scopes || []) {
    if (!grouped.has(row.UserAssignmentId)) grouped.set(row.UserAssignmentId, {
      userAssignmentId: row.UserAssignmentId,
      assignmentKey: row.AssignmentKey,
      assignmentName: row.AssignmentName,
      isPrimary: Boolean(row.IsPrimary),
      scopes: [],
    });
    if (row.ScopeType) grouped.get(row.UserAssignmentId).scopes.push({
      scopeType: row.ScopeType,
      scopeEntityId: row.ScopeEntityId,
      scopeName: row.ScopeName,
    });
  }
  return [...grouped.values()];
}

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
  const assignments = groupAssignments(user.AssignmentScopes);
  const primaryAssignment = assignments.find((item) => item.isPrimary) || null;
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
    defaultWorkspaceName: user.DefaultWorkspaceName,
    defaultWorkspaceRoute: user.DefaultWorkspaceRoute,
    legacyRole: user.LegacyRole,
    mustChangePassword: user.MustChangePassword,
    emailVerified: user.EmailVerified,
    isRegistrationCompleted: user.IsRegistrationCompleted,
    isProtectedRole: user.IsProtectedRole,
    assignmentScopes: user.AssignmentScopes || [],
    mainRole: { id: user.RoleId, key: user.RoleKey, name: user.RoleDisplayName || user.RoleName },
    resolvedWorkspace: { id: user.DefaultWorkspaceId, name: user.DefaultWorkspaceName, defaultRoute: user.DefaultWorkspaceRoute },
    primaryAssignment,
    assignments,
    scopes: assignments.flatMap((assignment) => assignment.scopes.map((scope) => ({ ...scope, userAssignmentId: assignment.userAssignmentId, assignmentKey: assignment.assignmentKey }))),
    permissions: user.EffectivePermissions || [],
    defaultRoute: user.DefaultWorkspaceRoute,
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
      assignmentScopes: user.AssignmentScopes || [],
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
 * @param {string} identifier - User employee ID, school email, or personal email.
 * @param {string} password - Plain text password.
 * @returns {Promise<object>} Token and safe user payload.
 */
async function login(identifier, password) {
  const normalizedIdentifier = String(identifier || "").trim();
  const user = await authRepository.findActiveUserByIdentifier(
    normalizedIdentifier
  );

  if (!user) {
    const error = new Error("Invalid ID number, email, or password.");
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
    const error = new Error("Invalid ID number, email, or password.");
    error.statusCode = 401;
    throw error;
  }

  await authRepository.markLoginSuccess(user.UserId);
  user.AssignmentScopes=await authRepository.getActiveAssignmentScopes(user.UserId);
  user.EffectivePermissions=(await permissionResolver.resolveUserPermissions(user.UserId)).allowedPermissionKeys;
  if(!user.DefaultWorkspaceId||!user.DefaultWorkspaceRoute)throw Object.assign(new Error("No active workspace is configured for this account."),{statusCode:409});

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
  user.AssignmentScopes=await authRepository.getActiveAssignmentScopes(user.UserId);
  user.EffectivePermissions=(await permissionResolver.resolveUserPermissions(user.UserId)).allowedPermissionKeys;
  if(!user.DefaultWorkspaceId||!user.DefaultWorkspaceRoute)throw Object.assign(new Error("No active workspace is configured for this account."),{statusCode:409});

  return buildUserPayload(user);
}
async function changePassword(userId,currentPassword,newPassword){
  if(!currentPassword||!newPassword)throw Object.assign(new Error("Current and new passwords are required."),{statusCode:400});
  if(String(newPassword).length<10||!/[A-Z]/.test(newPassword)||!/[a-z]/.test(newPassword)||!/\d/.test(newPassword))throw Object.assign(new Error("New password must be at least 10 characters and include uppercase, lowercase, and a number."),{statusCode:400});
  const currentHash=await authRepository.getPasswordHash(userId);if(!currentHash||!await bcrypt.compare(currentPassword,currentHash))throw Object.assign(new Error("Current password is incorrect."),{statusCode:400});
  if(await bcrypt.compare(newPassword,currentHash))throw Object.assign(new Error("New password must be different from the current password."),{statusCode:400});
  await authRepository.updatePassword(userId,await bcrypt.hash(newPassword,12));return{changed:true};
}

module.exports = {
  login,
  getMe,
  changePassword,
};
