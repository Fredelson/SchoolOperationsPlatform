// ============================================================
// Arab Unity School Operations Platform
// Require Permission Middleware
// ============================================================
//
// Purpose:
// Protects API routes using database-driven permission keys.
//
// Example:
// router.get(
//   "/users",
//   protect,
//   requirePermission("users.view"),
//   controller.getUsers
// );
//
// Architecture:
// Middleware Layer
//
// Rules:
// - No SQL directly
// - No role-name checks
// - Uses Permission Resolver Service
// ============================================================

const permissionResolverService = require("../services/permissionResolverService");

// ============================================================
// Require Permission
// ============================================================

function requirePermission(permissionKey) {
  return async function permissionMiddleware(req, res, next) {
    try {
      const currentUserId = req.user?.id || req.user?.UserId;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
          errors: null,
        });
      }

      const hasPermission =
        await permissionResolverService.userHasPermission(
          currentUserId,
          permissionKey
        );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
          errors: {
            requiredPermission: permissionKey,
          },
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = requirePermission;