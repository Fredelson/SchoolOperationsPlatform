// ============================================================
// Arab Unity School Operations Platform
// Permission Resolver Controller
// ============================================================
//
// Purpose:
// Exposes test/debug endpoints for resolving effective user
// permissions.
//
// Architecture:
// Controller Layer
//
// Rules:
// - No SQL
// - No business logic
// - No validation logic
// - Uses standardized API responses
// ============================================================

const permissionResolverService = require("../services/permissionResolverService");

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");

// ============================================================
// Resolve Current User Permissions
// ============================================================
//
// GET /api/permission-resolver/me
// ============================================================

const getMyPermissions = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.id || req.user?.UserId;

  const resolvedPermissions =
    await permissionResolverService.resolveUserPermissions(currentUserId);

  return sendSuccess(
    res,
    "Current user permissions resolved successfully.",
    resolvedPermissions
  );
});

// ============================================================
// Resolve Permissions By User ID
// ============================================================
//
// GET /api/permission-resolver/users/:userId
// ============================================================

const getUserPermissions = asyncHandler(async (req, res) => {
  const resolvedPermissions =
    await permissionResolverService.resolveUserPermissions(req.params.userId);

  return sendSuccess(
    res,
    "User permissions resolved successfully.",
    resolvedPermissions
  );
});

// ============================================================
// Check Current User Permission
// ============================================================
//
// GET /api/permission-resolver/me/check/:permissionKey
// ============================================================

const checkMyPermission = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.id || req.user?.UserId;

  const hasPermission =
    await permissionResolverService.userHasPermission(
      currentUserId,
      req.params.permissionKey
    );

  return sendSuccess(
    res,
    "Current user permission checked successfully.",
    {
      permissionKey: req.params.permissionKey,
      hasPermission,
    }
  );
});

module.exports = {
  getMyPermissions,
  getUserPermissions,
  checkMyPermission,
};