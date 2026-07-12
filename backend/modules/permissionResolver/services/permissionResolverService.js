// ============================================================
// Arab Unity School Operations Platform
// Permission Resolver Service
// ============================================================
//
// Purpose:
// Calculates the final effective permissions for a user by
// combining role permissions with user-specific overrides.
//
// Architecture:
// Service Layer
//
// Rules:
// - No SQL
// - No Express req/res
// - No route logic
// - Business logic only
// ============================================================

const repository = require("../repositories/permissionResolverRepository");
const serviceError = require("../../../shared/helpers/serviceError");

// ============================================================
// Normalize Role Key
// ============================================================

function normalizeRoleKey(roleKey = "") {
  return String(roleKey)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/_/g, "");
}

// ============================================================
// Convert Permission Rows To Map
// ============================================================

function buildPermissionMap(rolePermissions = []) {
  const permissionMap = new Map();

  rolePermissions.forEach((permission) => {
    permissionMap.set(permission.PermissionKey, {
      permissionId: permission.PermissionId,
      permissionKey: permission.PermissionKey,
      permissionName: permission.PermissionName,
      moduleId: permission.ModuleId,
      permissionGroupId: permission.PermissionGroupId,
      isAllowed: Boolean(permission.IsAllowed),
      source: "role",
    });
  });

  return permissionMap;
}

// ============================================================
// Apply User Overrides
// ============================================================

function applyUserOverrides(permissionMap, userOverrides = []) {
  userOverrides.forEach((override) => {
    permissionMap.set(override.PermissionKey, {
      permissionId: override.PermissionId,
      permissionKey: override.PermissionKey,
      permissionName: override.PermissionName,
      moduleId: override.ModuleId,
      permissionGroupId: override.PermissionGroupId,
      isAllowed: Boolean(override.IsAllowed),
      source: "userOverride",
      reason: override.Reason || null,
    });
  });

  return permissionMap;
}

// ============================================================
// Resolve User Permissions
// ============================================================

async function resolveUserPermissions(userId) {
  if (!userId || Number.isNaN(Number(userId))) {
    throw serviceError.badRequest("Valid User ID is required.");
  }

  const numericUserId = Number(userId);

  const userProfile = await repository.getUserSecurityProfile(numericUserId);

  if (!userProfile) {
    throw serviceError.notFound("User not found.");
  }

  if (!userProfile.IsActive) {
    throw serviceError.forbidden("User account is inactive.");
  }

  if (userProfile.IsLocked) {
    throw serviceError.forbidden("User account is locked.");
  }

  const rolePermissions = await repository.getRolePermissions(userProfile.RoleId);
  const userOverrides = await repository.getUserPermissionOverrides(numericUserId);
  const assignmentScopes = await repository.getActiveAssignmentScopes(numericUserId);

  const permissionMap = buildPermissionMap(rolePermissions);
  applyUserOverrides(permissionMap, userOverrides);

  const permissions = Array.from(permissionMap.values()).sort((a, b) =>
    a.permissionKey.localeCompare(b.permissionKey)
  );

  const allowedPermissionKeys = permissions
    .filter((permission) => permission.isAllowed)
    .map((permission) => permission.permissionKey);

  return {
    user: {
      userId: userProfile.UserId,
      fullName: userProfile.FullName,
      employeeId: userProfile.EmployeeId,
      schoolEmail: userProfile.SchoolEmail,
      roleId: userProfile.RoleId,
      roleKey: userProfile.RoleKey,
      roleName: userProfile.RoleName,
    },
    permissions,
    allowedPermissionKeys,
    assignmentScopes,
  };
}

// ============================================================
// Check Single Permission
// ============================================================

async function userHasPermission(userId, permissionKey) {
  if (!permissionKey) {
    throw serviceError.badRequest("Permission key is required.");
  }

  const resolved = await resolveUserPermissions(userId);

  // ============================================================
  // Super Admin Safety Bypass
  // ============================================================
  // Prevents Super Admin from being locked out during permission
  // seeding and early deployment.
  // ============================================================

  const roleKey = normalizeRoleKey(resolved.user?.roleKey);

  if (roleKey === "superadmin") {
    return true;
  }

  return resolved.allowedPermissionKeys.includes(permissionKey);
}

module.exports = {
  resolveUserPermissions,
  userHasPermission,
};
