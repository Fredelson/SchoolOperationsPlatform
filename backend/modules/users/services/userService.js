// backend/modules/users/services/userService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Service
 * ============================================================
 *
 * Purpose:
 * Contains business logic for user management.
 * ============================================================
 */

const userRepository = require("../repositories/userRepository");
const { hashPassword } = require("../../../shared/security/password");

/**
 * Checks whether current user is Super Admin.
 */
function isCurrentUserSuperAdmin(currentUser) {
  return currentUser?.role === "SuperAdmin" || currentUser?.roleKey === "SuperAdmin";
}

/**
 * Builds safe frontend user payload.
 */
function buildUserPayload(user) {
  return {
    id: user.UserId,
    employeeId: user.EmployeeId,
    fullName: user.FullName,
    schoolEmail: user.SchoolEmail,
    personalEmail: user.PersonalEmail,
    mobileNumber: user.MobileNumber,

    roleId: user.RoleId,
    roleKey: user.RoleKey,
    roleName: user.RoleName,
    roleDisplayName: user.RoleDisplayName,
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
    isActive: user.IsActive,
    isLocked: user.IsLocked,
    failedLoginAttempts: user.FailedLoginAttempts,
    lockedUntil: user.LockedUntil,
    lastLoginAt: user.LastLoginAt,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt,
    isProtectedRole: user.IsProtectedRole,
  };
}

/**
 * Gets all users.
 */
async function getUsers() {
  const users = await userRepository.findAllUsers();

  return {
    count: users.length,
    users: users.map(buildUserPayload),
  };
}

/**
 * Gets one user.
 */
async function getUserById(userId) {
  const user = await userRepository.findUserById(Number(userId));

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  return buildUserPayload(user);
}

/**
 * Creates a new user.
 */
async function createUser(payload, currentUser) {
  const {
    fullName,
    employeeId,
    schoolEmail,
    personalEmail,
    mobileNumber,
    role,
    roleId,
    departmentId,
    sectionId,
    defaultWorkspaceId,
  } = payload;

  if (!fullName || !employeeId || !schoolEmail || (!role && !roleId)) {
    const error = new Error("Full name, employee ID, school email, and role are required.");
    error.statusCode = 400;
    throw error;
  }

  const selectedRole = await userRepository.findRole(roleId || role);

  if (!selectedRole) {
    const error = new Error("Selected role was not found.");
    error.statusCode = 400;
    throw error;
  }

  if (selectedRole.IsProtected && !isCurrentUserSuperAdmin(currentUser)) {
    const error = new Error("Only Super Admin can create protected role users.");
    error.statusCode = 403;
    throw error;
  }

  const duplicate = await userRepository.findDuplicateUser(employeeId, schoolEmail);

  if (duplicate) {
    const error = new Error("Employee ID or school email already exists.");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(employeeId);

  const newUserId = await userRepository.createUser({
    fullName,
    employeeId,
    schoolEmail,
    personalEmail,
    mobileNumber,
    passwordHash,
    roleId: selectedRole.RoleId,
    departmentId,
    sectionId,
    defaultWorkspaceId,
    legacyRole: selectedRole.RoleKey,
  });

  return {
    userId: newUserId,
    defaultPassword: employeeId,
  };
}

/**
 * Updates an existing user.
 */
async function updateUser(userId, payload, currentUser) {
  const existingUser = await userRepository.findUserById(Number(userId));

  if (!existingUser) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (existingUser.IsProtectedRole && !isCurrentUserSuperAdmin(currentUser)) {
    const error = new Error("Only Super Admin can modify protected users.");
    error.statusCode = 403;
    throw error;
  }

  const selectedRole = await userRepository.findRole(payload.roleId || payload.role);

  if (!selectedRole) {
    const error = new Error("Selected role was not found.");
    error.statusCode = 400;
    throw error;
  }

  if (selectedRole.IsProtected && !isCurrentUserSuperAdmin(currentUser)) {
    const error = new Error("Only Super Admin can assign protected roles.");
    error.statusCode = 403;
    throw error;
  }

  const duplicate = await userRepository.findDuplicateUser(
    existingUser.EmployeeId,
    payload.schoolEmail,
    Number(userId)
  );

  if (duplicate) {
    const error = new Error("School email already exists.");
    error.statusCode = 400;
    throw error;
  }

  await userRepository.updateUser(Number(userId), {
    fullName: payload.fullName,
    schoolEmail: payload.schoolEmail,
    personalEmail: payload.personalEmail,
    mobileNumber: payload.mobileNumber,
    roleId: selectedRole.RoleId,
    departmentId: payload.departmentId,
    sectionId: payload.sectionId,
    defaultWorkspaceId: payload.defaultWorkspaceId,
    legacyRole: selectedRole.RoleKey,
  });

  return true;
}

/**
 * Deactivates user.
 */
async function deactivateUser(userId, currentUser) {
  const user = await userRepository.findUserById(Number(userId));

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.IsProtectedRole && !isCurrentUserSuperAdmin(currentUser)) {
    const error = new Error("Only Super Admin can deactivate protected users.");
    error.statusCode = 403;
    throw error;
  }

  await userRepository.setUserActiveStatus(Number(userId), false);
}

/**
 * Activates user.
 */
async function activateUser(userId) {
  const user = await userRepository.findUserById(Number(userId));

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  await userRepository.setUserActiveStatus(Number(userId), true);
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
};